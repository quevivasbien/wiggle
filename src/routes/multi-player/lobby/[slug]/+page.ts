import { error, type LoadEvent } from '@sveltejs/kit';
import * as stores from 'svelte/store';
import { myID } from "$data/stores";
import { get, ref, set } from 'firebase/database';
import { database, type ActiveGameData, type GameData } from '$scripts/database';

const myIDValue = stores.get(myID);

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
    // set my ready status to false
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    await get(lobbyRef).then((snapshot) => {
        const playersReady = snapshot.val() || {};
        playersReady[myIDValue] = false;
        set(lobbyRef, playersReady);
    });
}

async function startGame_(gameID: string) {
    console.log("starting game", gameID);
    // remove the lobby from lobbies list & save list of players
    const lobbyRef = ref(database, `lobbies/${gameID}`);
    const lobbySnapshot = await get(lobbyRef);
    const playersReady = lobbySnapshot.val();
    if (!playersReady) {
        console.log("no players in lobby when attempting to start game");
        return;
    }
    set(lobbyRef, null);
    const players = Object.keys(playersReady);
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
        players,
        timeStarted: Date.now(),
    };
    set(activeGameRef, newActiveGameData);
}

async function setReady_(lobbyID: string) {
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    await get(lobbyRef).then((snapshot) => {
        const playersReady = snapshot.val() || {};
        if (playersReady[myIDValue] === undefined) {
            console.log("When attempting to set ready status, user not in lobby");
            return;
        }
        playersReady[myIDValue] = true;
        set(lobbyRef, playersReady);
    });
}

async function exitLobby_(lobbyID: string) {
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    await get(lobbyRef).then((snapshot) => {
        const playersReady = snapshot.val() || {};
        if (playersReady[myIDValue] === undefined) {
            console.log("When attempting to leave lobby, user not in lobby");
            return;
        }
        delete playersReady[myIDValue];
        set(lobbyRef, playersReady);
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