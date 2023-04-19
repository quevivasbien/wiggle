import { env } from "$env/dynamic/private";

import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { get, getDatabase, ref, set } from 'firebase/database';

function setupDatabase(firebaseConfig: FirebaseOptions) {
    const app = initializeApp(firebaseConfig);
    return getDatabase(app);
}

const firebaseConfig = {
    databaseURL: env.DATABASE_URL,
};

export const database = setupDatabase(firebaseConfig);

export async function startGame(gameID: string) {
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
    const gameData = gameSnapshot.val();
    if (!gameData) {
        console.log("no game data when attempting to start game");
        return;
    }
    set(gameRef, null);
    // add game to active games database
    const activeGameRef = ref(database, `activeGames/${gameID}`);
    set(activeGameRef, {
        ...gameData,
        players,
        // wordsFound: {},
    })
}