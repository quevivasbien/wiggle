import { error, type LoadEvent } from '@sveltejs/kit';
import { newRandomId, type GameData } from '$scripts/multiplayer.js';

export async function load(event: LoadEvent) {
    const lobbyID = event.params.slug;
    // get game info from database
    const gameResponse = await event.fetch(`/api/games?gameID=${lobbyID}`);
    if (!gameResponse.ok) {
        return error(404, "Game not found");
    };
    const gameData: GameData = await gameResponse.json();
    // generate user id
    const myID = newRandomId();
    // join the lobby
    await event.fetch(`/api/lobbies`, {
        method: "POST",
        body: JSON.stringify({
            userID: myID,
            lobbyID: lobbyID,
            action: "join",
        }),
    }).then((response) => {
        console.log("Joined jobby and received response: ", response);
    });
    // get a reader for the lobby stream
    // subscribe to stream
    const lobbyResponse = await event.fetch(`/api/lobbies?lobbyID=${lobbyID}`);
    const lobbyStream = lobbyResponse.body;
    if (!lobbyStream) {
        throw new Error("No response body from lobby stream request");
    }
    const lobbyStreamReader = lobbyStream.pipeThrough(new TextDecoderStream()).getReader();

    const exitLobby = () => {
        // remove this player from the database lobby
        event.fetch("/api/lobbies", {
            method: "POST",
            body: JSON.stringify(({
                userID: myID,
                lobbyID: lobbyID,
                action: "leave",
            }))
        });
        // disconnect the reader & unsubscribe from the stream
        lobbyStreamReader.cancel();
    };

    return {
        lobbyID,
        myID,
        gameData,
        lobbyStreamReader,
        exitLobby,
    };
}