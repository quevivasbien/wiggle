import { error, type LoadEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { myID } from "$data/stores";

const myIDValue = get(myID);

export async function load(event: LoadEvent) {
    const { gameID } = event.params;
    // get game data
    const gameData = await (await event.fetch(`/api/active-game?gameID=${gameID}`)).json();
    // check that the user belongs in this game
    if (!gameData.players.includes(myIDValue)) {
        throw error(403, "You are not a player in this game. This may be because you refreshed the page and were assigned a new user ID.");
    }
    // subscribe to stream of words found
    const response = await event.fetch(`/api/active-game?gameID=${gameID}&subscribe=true`);
    const wordsFoundStream = response.body;
    if (!wordsFoundStream) {
        throw error(500, "No response body from words stream request");
    }
    const wordsFoundStreamReader = wordsFoundStream.pipeThrough(new TextDecoderStream()).getReader();

    const submitWord = async (word: string) => {
        // tell the server you've found a word,
        // returns true if the word is accepted
        const url = `/api/active-game?gameID=${gameID}&playerID=${myIDValue}&word=${word}`;
        const response = await event.fetch(url, { method: "POST" });
        if (!response.ok) {
            console.log("When submitting word:", response.statusText);
            return false;
        }
        return true;
    }

    const quit = () => {
        // disconnect from the stream & tell the server you've quit
        wordsFoundStreamReader.cancel();
        event.fetch(`/api/active-game?gameID=${gameID}&playerID=${myIDValue}`, { method: "DELETE" })
    }

    return {
        gameID,
        gameData,
        wordsFoundStreamReader,
        submitWord,
        quit,
    };
}