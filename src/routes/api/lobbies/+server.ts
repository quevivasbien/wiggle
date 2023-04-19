import { get, onValue, ref, set, type Unsubscribe } from "firebase/database";
import { database, startGame } from "$server/database";

export async function GET({ url }) {
    // subscribe to a stream of updates to a lobby
    const lobbyID = (url as URL).searchParams.get("lobbyID");
    if (!lobbyID) {
        return new Response("lobbyID param required", { status: 400 });
    }
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    let unsubscribe: Unsubscribe;
    const stream = new ReadableStream({
        start(controller) {
            unsubscribe = onValue(lobbyRef, (snapshot) => {
                const playersReady: Record<string, boolean> = snapshot.val();
                if (!playersReady) {
                    console.log("playersReady is null");
                    return;
                }
                controller.enqueue(JSON.stringify(playersReady));
                if (Object.keys(playersReady).length > 1 && Object.values(playersReady).every((ready) => ready)) {
                    startGame(lobbyID);
                }
            });
        },
        cancel() {
            if (unsubscribe) {
                unsubscribe();
            }
            else {
                console.error("lobby stream canceled before it was started");
            }
            console.log("lobby stream cancelled successfully");
        },
    });
    return new Response(stream, {
        headers: {
            "content-type": "text/event-stream",
        },
    });
}

async function joinLobby(lobbyID: string, userID: string) {
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    await get(lobbyRef).then((snapshot) => {
        const playersReady = snapshot.val() || {};
        playersReady[userID] = false;
        set(lobbyRef, playersReady);
    });
}

async function setReady(lobbyID: string, userID: string) {
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    await get(lobbyRef).then((snapshot) => {
        const playersReady = snapshot.val() || {};
        if (playersReady[userID] === undefined) {
            console.log("When attempting to set ready status, user not in lobby");
            return;
        }
        playersReady[userID] = true;
        set(lobbyRef, playersReady);
    });
}

async function leaveLobby(lobbyID: string, userID: string) {
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    await get(lobbyRef).then((snapshot) => {
        const playersReady = snapshot.val() || {};
        if (playersReady[userID] === undefined) {
            console.log("When attempting to leave lobby, user not in lobby");
            return;
        }
        delete playersReady[userID];
        set(lobbyRef, playersReady);
    });
}

export async function POST({ request }) {
    const { userID, lobbyID, action } = await request.json();
    if (action === "join") {
        await joinLobby(lobbyID, userID);
        return new Response("ok");
    }
    else if (action === "ready") {
        await setReady(lobbyID, userID);
        return new Response("ok");
    }
    else if (action === "leave") {
        await leaveLobby(lobbyID, userID);
        return new Response("ok");
    }
    return new Response("invalid action", { status: 400 });
}