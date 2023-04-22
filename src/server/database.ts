import { DATABASE_URL, SERVICE_ACCOUNT } from "$env/static/private";

import admin from "firebase-admin";

const serviceAccount = JSON.parse(SERVICE_ACCOUNT);

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: DATABASE_URL,
});

export const database = app.database();

export async function startGame(gameID: string) {
    console.log("starting game", gameID);
    // remove the lobby from lobbies list & save list of players
    const lobbyRef = database.ref(`lobbies/${gameID}`);
    const lobbySnapshot = await lobbyRef.get();
    const playersReady = lobbySnapshot.val();
    if (!playersReady) {
        console.log("no players in lobby when attempting to start game");
        return;
    }
    lobbyRef.set(null);
    const players = Object.keys(playersReady);
    // remove the game from the games list, save gamedata
    const gameRef = database.ref(`games/${gameID}`);
    const gameSnapshot = await gameRef.get();
    const gameData = gameSnapshot.val();
    if (!gameData) {
        console.log("no game data when attempting to start game");
        return;
    }
    gameRef.set(null);
    // add game to active games database
    const activeGameRef = database.ref(`activeGames/${gameID}`);
    activeGameRef.set({
        ...gameData,
        players,
        // wordsFound: {},
    });
}