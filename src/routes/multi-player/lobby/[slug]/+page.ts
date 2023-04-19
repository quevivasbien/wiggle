import { error, redirect, type LoadEvent } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { GameData } from '$scripts/multiplayer.js';
import { myID } from "$data/stores";

const myIDValue = get(myID);

export async function load(event: LoadEvent) {
    const lobbyID = event.params.slug;
    // get game info from database
    const gameResponse = await event.fetch(`/api/games?gameID=${lobbyID}`);
    if (!gameResponse.ok) {
        // redirect to game page
        throw redirect(301, "/multi-player");
    };
    const gameData: GameData = await gameResponse.json();
    // join the lobby
    await event.fetch(`/api/lobbies`, {
        method: "POST",
        body: JSON.stringify({
            userID: myIDValue,
            lobbyID: lobbyID,
            action: "join",
        }),
    }).then((response) => {
        console.log("Joined lobby and received response: ", response);
    });
    // get a reader for the lobby stream
    // subscribe to stream
    const lobbyResponse = await event.fetch(`/api/lobbies?lobbyID=${lobbyID}`);
    if (!lobbyResponse.ok) {
        throw error(404, "No lobby found");
    }
    const lobbyStream = lobbyResponse.body;
    if (!lobbyStream) {
        throw error(500, "No response body from lobby stream request");
    }
    const lobbyStreamReader = lobbyStream.pipeThrough(new TextDecoderStream()).getReader();

    const exitLobby = () => {
        // remove this player from the database lobby
        event.fetch("/api/lobbies", {
            method: "POST",
            body: JSON.stringify(({
                userID: myIDValue,
                lobbyID: lobbyID,
                action: "leave",
            }))
        });
        // disconnect the reader & unsubscribe from the stream
        lobbyStreamReader.cancel();
    };

    return {
        lobbyID,
        gameData,
        lobbyStreamReader,
        exitLobby,
    };
}