import { get, onValue, ref, set, type Unsubscribe } from "firebase/database";
import { database } from "$server/database";

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
                const playersReady = snapshot.val() || {};
                try {
                    controller.enqueue(JSON.stringify(playersReady));
                }
                catch (error) {
                    console.error("When updating lobby stream: " + error);
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
            throw new Error("user not in lobby");
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
            throw new Error("user not in lobby");
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