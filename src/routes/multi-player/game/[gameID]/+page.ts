import { error, type LoadEvent } from "@sveltejs/kit";
import * as stores from "svelte/store";
import { get, ref, remove, set } from "firebase/database";
import { myID } from "$data/stores";
import { database } from "$scripts/database";

const myIDValue = stores.get(myID);

async function getGameInfo(gameID: string) {
    const gameRef = ref(database, `activeGames/${gameID}`);
    const gameData = (await get(gameRef)).val();
    if (!gameData) {
        throw error(404, `Game ${gameID} does not exist. This may be because the game timed out.`);
    }
    return gameData;
}

async function submitWord_(gameID: string, word: string) {
    console.log(`Checking word "${word}" on database`);
    const wordsFoundRef = ref(database, `activeGames/${gameID}/wordsFound`);
    const wordsFound = (await get(wordsFoundRef)).val() ?? {};
    if (wordsFound) {
        for (const player in wordsFound) {
            if (wordsFound[player].includes(word)) {
                console.log(`Word "${word}" already found by player ${player}`);
                return false;
            }
        }
    }
    console.log(`Word "${word}" is valid`);
    wordsFound[myIDValue] = [...(wordsFound[myIDValue] ?? []), word];
    set(wordsFoundRef, wordsFound);
    return true;
}

async function quit_(gameID: string) {
    const playersRef = ref(database, `activeGames/${gameID}/players`);
    const players: string[] = (await get(playersRef)).val() ?? [];
    const index = players.indexOf(myIDValue);
    // remove player from list of players
    if (index > -1) {
        players.splice(index, 1);
        set(playersRef, players);
        console.log(`Removed player ${myIDValue} from game ${gameID}`);
    }
    else {
        console.log(`Player ${myIDValue} was not in game ${gameID}`);
    }
    // if no players left, delete game
    if (players.length === 0) {
        const gameRef = ref(database, `activeGames/${gameID}`);
        await remove(gameRef);
        console.log(`Deleted game ${gameID}`);
    }
}

export async function load(event: LoadEvent) {
    const { gameID } = event.params;
    if (!gameID) {
        throw error(500, "Game ID is missing");
    }
    // get game data
    const gameData = await getGameInfo(gameID);
    // check that the user belongs in this game
    if (!gameData.players.includes(myIDValue)) {
        throw error(403, "You are not a player in this game. This may be because you left or refreshed the page.");
    }
    const submitWord = async (word: string) => submitWord_(gameID, word);
    const quit = () => quit_(gameID);

    return {
        gameID,
        gameData,
        submitWord,
        quit,
    };
}