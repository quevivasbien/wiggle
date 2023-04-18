export async function load(event) {
    // subscribe to games state updates
    const response = await event.fetch("/api/games");
    const gamesStream = response.body;
    if (!gamesStream) {
        throw new Error("No games stream in response");
    }
    const gamesReader = gamesStream.pipeThrough(new TextDecoderStream()).getReader();

    const newGame = (size: number, minLength: number) => {
        event.fetch(
            "/api/games",
            {
                method: "POST",
                body: JSON.stringify({ size, minLength }),
                headers: {
                    "Content-Type": "application/json"
                },
            }
        ).then(
            (response) => {
                console.log("Created game & got response: ", response);
            }
        )
    }

    return {
        gamesReader,
        newGame,
    }
}