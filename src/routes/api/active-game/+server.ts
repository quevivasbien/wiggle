import { get, onValue, ref, set, type Unsubscribe } from 'firebase/database';

import { database } from '$server/database.js';

function subscribeToStream(gameID: string) {
    const wordsFoundRef = ref(database, `activeGames/${gameID}/wordsFound`);
    let unsubscribe: Unsubscribe;
    const stream = new ReadableStream({
        start(controller) {
            unsubscribe = onValue(wordsFoundRef, (snapshot) => {
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
            if (unsubscribe) {
                unsubscribe();
            }
            else {
                console.error('active game stream canceled before it was started');
            }
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
    const gameRef = ref(database, `activeGames/${gameID}`);
    const gameData = (await get(gameRef)).val();
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
    const wordsFoundRef = ref(database, `activeGames/${gameID}/wordsFound`);
    const wordsFound = (await get(wordsFoundRef)).val() ?? {};
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
    set(wordsFoundRef, wordsFound);
    return new Response('ok');
}