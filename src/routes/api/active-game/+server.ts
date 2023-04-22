import { database } from '$server/database.js';

function subscribeToStream(gameID: string) {
    const wordsFoundRef = database.ref(`activeGames/${gameID}/wordsFound`);
    const stream = new ReadableStream({
        start(controller) {
            wordsFoundRef.on("value", (snapshot) => {
                const wordsFound = snapshot.val() ?? {};
                if (!wordsFound) {
                    console.log('wordsFound is null');
                    return;
                }
                controller.enqueue(JSON.stringify(wordsFound));
                console.log('sent words found', wordsFound);
            });
        },
        cancel() {
            wordsFoundRef.off("value");
            console.log('active game stream cancelled successfully');
        },
    });
    return new Response(
        stream,
        {
            headers: {
                'content-type': 'text/event-stream',
            },
        },
    );
}

export async function GET({ url }) {
    // subscribe to stream of game state
    const gameID = url.searchParams.get('gameID');
    if (!gameID) {
        return new Response('gameID param required', { status: 400 });
    }
    const subscribe = url.searchParams.get('subscribe') === 'true';
    if (subscribe) {
        return subscribeToStream(gameID);
    }
    // o.w. return the game info
    const gameRef = database.ref(`activeGames/${gameID}`);
    const gameData = (await gameRef.get()).val();
    return new Response(JSON.stringify(gameData));
}

export async function POST({ url }) {
    // tell the server you've found a word
    const gameID = url.searchParams.get('gameID');
    if (!gameID) {
        return new Response('gameID param required', { status: 400 });
    }
    const playerID = url.searchParams.get('playerID');
    if (!playerID) {
        return new Response('playerID param required', { status: 400 });
    }
    const word = url.searchParams.get('word');
    if (!word) {
        return new Response('word param required', { status: 400 });
    }
    console.log("Checking word", word);
    // check if the word has already been found
    const wordsFoundRef = database.ref(`activeGames/${gameID}/wordsFound`);
    const wordsFound = (await wordsFoundRef.get()).val() ?? {};
    if (wordsFound) {
        for (const player in wordsFound) {
            if (wordsFound[player].includes(word)) {
                return new Response(`word already found by player ${player}`, { status: 400 });
            }
        }
    }
    // if not already found, add it to the list of words found
    console.log(wordsFound);
    wordsFound[playerID] = [...wordsFound[playerID] ?? [], word];
    wordsFoundRef.set(wordsFound);
    return new Response('ok');
}

export async function DELETE({ url }) {
    // quit the game
    const gameID = url.searchParams.get('gameID');
    if (!gameID) {
        return new Response('gameID param required', { status: 400 });
    }
    const playerID = url.searchParams.get('playerID');
    if (!playerID) {
        return new Response('playerID param required', { status: 400 });
    }
    const playersRef = database.ref(`activeGames/${gameID}/players`);
    const players: string[] = (await playersRef.get()).val() ?? [];
    const index = players.indexOf(playerID);
    // remove the player from the list of players
    if (index > -1) {
        players.splice(index, 1);
        playersRef.set(players);
        console.log("Player", playerID, "removed from game", gameID);
    }
    // if there are no more players, delete the game
    if (players.length === 0) {
        const gameRef = database.ref(`activeGames/${gameID}`);
        await gameRef.remove();
        console.log("Game", gameID, "deleted");
    }
    return new Response('ok');
}