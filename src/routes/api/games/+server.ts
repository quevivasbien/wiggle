import { database } from '$server/database';

import { MultiplayerGame, type GameData } from '$scripts/multiplayer';
import { ref, onValue } from "firebase/database";
import Board from '$scripts/board';

let games: Record<string, GameData> = {};
const gamesRef = ref(database, "games");

export function GET() {
    // get a list of all current games
    const stream = new ReadableStream({
        start(controller) {
            // send the client the current games whenever the database changes
            onValue(gamesRef, (snapshot) => {
                games = snapshot.val();
                controller.enqueue(JSON.stringify(games));
            });
        },
        cancel() {
            console.log("multiplayer stream cancelled");
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
    const board = Board.random(size, minLength);
    MultiplayerGame.create(board, database);
    return new Response("ok");
}