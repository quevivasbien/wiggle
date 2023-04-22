import { database } from '$server/database';

import { MultiplayerGame, type GameData } from '$scripts/multiplayer';
import { ref, onValue, get, type Unsubscribe } from "firebase/database";
import BoardData from '$scripts/board';

let games: Record<string, GameData> = {};
const gamesRef = database.ref("games");

async function getGame(gameID: string) {
    const gameRef = database.ref(`games/${gameID}`);
    const snapshot = await gameRef.get();
    if (!snapshot.exists()) {
        console.log(`When fetching game info, game ${gameID} does not exist`);
        return null;
    }
    return snapshot.val();
}

export async function GET({ url }) {
    const gameID = (url as URL).searchParams.get("gameID");
    if (gameID) {
        const gameData = await getGame(gameID);
        if (!gameData) {
            return new Response("Game not found", { status: 404 });
        }
        return new Response(JSON.stringify(gameData));
    }
    // subscribe to a list of all current games
    const stream = new ReadableStream({
        start(controller) {
            // send the client the current games whenever the database changes
            gamesRef.on("value", (snapshot) => {
                games = snapshot.val();
                try {
                    controller.enqueue(JSON.stringify(games));
                }
                catch (error) {
                    console.error("When updating games stream: " + error);
                }
            });
        },
        cancel() {
            gamesRef.off("value");
            console.log("multiplayer stream cancelled successfully");
        },
    });
    return new Response(stream, {
        headers: {
            "content-type": "text/event-stream",
        },
    });
}

export async function POST({ request }) {
    // create a new game, return game id
    const { size, minLength } = await request.json();
    const board = BoardData.random(size, minLength);
    const game = await MultiplayerGame.create(board, database);
    return new Response(game.id);
}
