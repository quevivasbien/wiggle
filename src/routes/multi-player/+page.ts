import { goto } from "$app/navigation";
import type { LoadEvent } from "@sveltejs/kit";

export async function load(event: LoadEvent) {
    // subscribe to games state updates
    const response = await event.fetch("/api/games");
    const gamesStream = response.body;
    if (!gamesStream) {
        throw new Error("No games stream in response");
    }
    const gamesReader = gamesStream.pipeThrough(new TextDecoderStream()).getReader();

    const newGame = async (size: number, minLength: number) => {
        const response = await event.fetch(
            "/api/games",
            {
                method: "POST",
                body: JSON.stringify({ size, minLength }),
                headers: {
                    "Content-Type": "application/json"
                },
            }
        );
        const gameID = await response.text();
        // join the new lobby
        goto(`/multi-player/lobby/${gameID}`);
    }

    return {
        gamesReader,
        newGame,
    }
}