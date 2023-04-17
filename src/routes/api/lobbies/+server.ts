import { get, onValue, ref, set } from "firebase/database";
import { database } from "$server/database";

export async function GET({ request }) {
    // subscribe to a stream of updates to a lobby
    const { lobbyID } = await request.json();
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    const stream = new ReadableStream({
        start(controller) {
            onValue(lobbyRef, (snapshot) => {
                const playersReady = snapshot.val() || {};
                controller.enqueue(JSON.stringify(playersReady));
            });
        },
        cancel() {
            console.log("lobby stream cancelled");
        },
    });
    return new Response(stream, {
        headers: {
            "content-type": "text/event-stream",
        },
    });
}

function joinLobby(lobbyID: string, userID: string) {
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    get(lobbyRef).then((snapshot) => {
        const playersReady = snapshot.val() || {};
        playersReady[userID] = false;
        set(lobbyRef, playersReady);
    });
}

function setReady(lobbyID: string, userID: string) {
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    get(lobbyRef).then((snapshot) => {
        const playersReady = snapshot.val() || {};
        if (playersReady[userID] === undefined) {
            throw new Error("user not in lobby");
        }
        playersReady[userID] = true;
        set(lobbyRef, playersReady);
    });
}

function leaveLobby(lobbyID: string, userID: string) {
    const lobbyRef = ref(database, `lobbies/${lobbyID}`);
    get(lobbyRef).then((snapshot) => {
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
        joinLobby(lobbyID, userID);
        return new Response("ok");
    }
    else if (action === "ready") {
        setReady(lobbyID, userID);
        return new Response("ok");
    }
    else if (action === "leave") {
        leaveLobby(lobbyID, userID);
        return new Response("ok");
    }
    return new Response("invalid action", { status: 400 });
}