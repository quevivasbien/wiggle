<script lang="ts">
    import type { GameData } from "$scripts/multiplayer";
    import { onDestroy, onMount } from "svelte";
    import GamePreview from "./GamePreview.svelte";
    import { slide } from "svelte/transition";

    let games: Record<string, GameData> = {};
    $: gameIDs = games ? Object.keys(games) : [];

    let reader: ReadableStreamDefaultReader;

    onMount(async () => {
        // subscribe to a stream that gives the list of games
        const response = await fetch("/api/games");
        const stream = response.body;
        if (!stream) {
            throw new Error("No response body");
        }
        reader = stream.pipeThrough(new TextDecoderStream()).getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            games = JSON.parse(value);
        }

    });

    onDestroy(() => {
        // close the stream
        reader.cancel();
    });

    let showNewGameMenu = false;
    let size: number = 4;
    let minLength: number = 3;

    function newGame() {
        fetch(
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


</script>

<div>
    <div class="text-xl font-bold">
        Games
    </div>
    <ol class="list-none list-inside">
        {#each gameIDs as gameID}
            <GamePreview id={gameID} game={games[gameID]} />
        {/each}
    </ol>
</div>
<div>
    {#if !showNewGameMenu}
        <button class="w-1/3 mx-auto my-4 py-2 px-3 rounded-lg bg-white border-2 hover:border-blue-100 focus:bg-gray-100 drop-shadow" on:click={() => showNewGameMenu = true}>New game</button>
    {:else}
        <form class="flex flex-col m-2 p-2 bg-gray-100 rounded-md" on:submit={(e) => { e.preventDefault(); newGame(); showNewGameMenu = false; }} transition:slide >
            <label class="p-2" for="size">
                <div class="p-3">
                    Board size:
                </div>
                <div class="flex flex-row justify-center">
                    <input class="w-1/3 accent-gray-500" type="range" min="3" max="6" bind:value={size} />
                    <div class="px-3">
                        {size} x {size}
                    </div>
                </div>
            </label>
            <label class="p-2" for="minLength">
                <div class="p-3">
                    Minimum word length:
                </div>
                <div class="flex flex-row justify-center">
                    <input class="w-1/3 accent-gray-500" type="range" min="3" max="5" bind:value={minLength} />
                    <div class="px-3">
                        {minLength}
                    </div>
                </div>
            </label>
            <button type="submit" class="w-1/3 mx-auto my-4 py-2 px-3 rounded-lg bg-white border-2 hover:border-blue-100 focus:bg-gray-100 drop-shadow">Create</button>
        </form>
    {/if}
</div>