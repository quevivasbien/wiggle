import { error, type LoadEvent } from '@sveltejs/kit';
import * as stores from 'svelte/store';
import { get, ref, set } from 'firebase/database';
import { database, type ActiveGameData, type GameData, type LobbyData } from '$scripts/firebase/config';
import { user } from '$data/stores';

const myIDValue = stores.get(user)?.uid ?? '';
const myDisplayName = stores.get(user)?.displayName ?? '';

async function getGameInfo(gameID: string): Promise<GameData> {
    const gameRef = ref(database, `games/${gameID}`);
    const snapshot = await get(gameRef);
    if (!snapshot.exists()) {
        throw error(404, `Game ${gameID} does not exist. This may be because the lobby timed out.`)
    }
    return snapshot.val();
}

async function joinLobby(lobbyID: string) {
    // add 1 to playersInLobby
    const playersInLobbyRef = ref(database, `games/${lobbyID}/playersInLobby`);
    await get(playersInLobbyRef).then((snapshot) => {
        const playersInLobby: number | null = snapshot.val();
        if (playersInLobby === null) {
            throw error(404, `When joining lobby, game ${lobbyID} does not exist. This may be because the lobby timed out.`);
        }
        set(playersInLobbyRef, playersInLobby + 1);
    });
    // set my ready status to false; add my display name to lobby info
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    await get(lobbyRef).then((snapshot) => {
        const lobbyData: LobbyData = snapshot.val() ?? {};
        lobbyData.playersReady = lobbyData.playersReady ?? {};
        lobbyData.playersReady[myIDValue] = false;
        lobbyData.playerNames = lobbyData.playerNames ?? {};
        lobbyData.playerNames[myIDValue] = myDisplayName;
        set(lobbyRef, lobbyData);
    });
}

async function startGame_(gameID: string) {
    console.log("starting game", gameID);
    // remove the lobby from lobbies list & save list of players
    const lobbyRef = ref(database, `lobbies/${gameID}`);
    const lobbySnapshot = await get(lobbyRef);
    const lobbyData = lobbySnapshot.val();
    if (!lobbyData.playersReady) {
        console.log("no players in lobby when attempting to start game");
        return;
    }
    set(lobbyRef, null);
    // remove the game from the games list, save gamedata
    const gameRef = ref(database, `games/${gameID}`);
    const gameSnapshot = await get(gameRef);
    const gameData: GameData | null = gameSnapshot.val();
    if (!gameData) {
        console.log("no game data when attempting to start game");
        return;
    }
    set(gameRef, null);
    // add game to active games database
    const activeGameRef = ref(database, `activeGames/${gameID}`);
    const newActiveGameData: ActiveGameData = {
        size: gameData.size,
        chars: gameData.chars,
        minLength: gameData.minLength,
        players: lobbyData.playerNames,
        timeLimit: gameData.timeLimit,
        timeStarted: Date.now(),
    };
    set(activeGameRef, newActiveGameData);
}

async function setReady_(lobbyID: string) {
    const playersReadyRef = ref(database, `lobbies/${lobbyID}/playersReady`);
    await get(playersReadyRef).then((snapshot) => {
        const playersReady = snapshot.val() || {};
        if (playersReady[myIDValue] === undefined) {
            console.log("When attempting to set ready status, user not in lobby");
            return;
        }
        playersReady[myIDValue] = true;
        set(playersReadyRef, playersReady);
    });
}

function exitLobby_(lobbyID: string) {
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    get(lobbyRef).then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("When attempting to leave lobby, lobby does not exist");
            return;
        }
        const lobbyData = snapshot.val() || {};
        if (lobbyData.playersReady[myIDValue] === undefined || lobbyData.playerNames[myIDValue] === undefined) {
            console.log("When attempting to leave lobby, user not in lobby");
            return;
        }
        delete lobbyData.playersReady[myIDValue];
        delete lobbyData.playerNames[myIDValue];
        set(lobbyRef, lobbyData);
        // subtract 1 from playersInLobby
        const playersInLobbyRef = ref(database, `games/${lobbyID}/playersInLobby`);
        get(playersInLobbyRef).then((snapshot) => {
            const playersInLobby: number | null = snapshot.val();
            if (playersInLobby === null) {
                throw error(500, `When leaving lobby, game ${lobbyID} does not exist`);
            }
            set(playersInLobbyRef, playersInLobby - 1);
        });
    });
}

export async function load(event: LoadEvent) {
    const lobbyID = event.params.slug;
    if (lobbyID === undefined) {
        throw error(500, "No lobby ID provided");
    }
    // get game info from database
    const gameData = await getGameInfo(lobbyID);
    // join the lobby
    await joinLobby(lobbyID);

    const setReady = () => setReady_(lobbyID);
    const exitLobby = () => exitLobby_(lobbyID);
    const startGame = () => startGame_(lobbyID);

    return {
        lobbyID,
        gameData,
        setReady,
        exitLobby,
        startGame,
    };
}