import { database } from '$server/database';

import { MultiplayerGame, type GameData } from '$scripts/multiplayer';
import { ref, onValue, get, type Unsubscribe } from "firebase/database";
import BoardData from '$scripts/board';

let games: Record<string, GameData> = {};
const gamesRef = ref(database, "games");

async function getGame(gameID: string) {
    const gameRef = ref(database, `games/${gameID}`);
    const snapshot = await get(gameRef);
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
    let unsubscribe: Unsubscribe;
    const stream = new ReadableStream({
        start(controller) {
            // send the client the current games whenever the database changes
            unsubscribe = onValue(gamesRef, (snapshot) => {
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
            if (unsubscribe) {
                // unsubscribe from database updates
                unsubscribe();
            }
            else {
                console.error("games stream cancelled before it was started");
            }
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
    // create a new game
    const { size, minLength } = await request.json();
    const board = BoardData.random(size, minLength);
    MultiplayerGame.create(board, database);
    return new Response("ok");
}
