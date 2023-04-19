<script lang="ts">
    // disable pre-loading
    import { setContext } from "svelte";
    setContext("preload", null);

    import type { GameData } from "$scripts/multiplayer";
    import { onDestroy, onMount } from "svelte";
    import GamePreview from "./GamePreview.svelte";
    import { slide } from "svelte/transition";
    import StyledButton from "$components/StyledButton.svelte";

    export let data;

    let games: Record<string, GameData>;
    $: gameIDs = games ? Object.keys(games) : [];

    onMount(async () => {
        while (true) {
            const { done, value } = await data.gamesReader.read();
            if (done) {
                console.log("Received done signal from gamesReader");
                break;
            }
            console.log("Received games update: ", value);
            games = JSON.parse(value);
        }

    });

    onDestroy(() => {
        // close the stream
        data.gamesReader.cancel();
    });

    let showNewGameMenu = false;
    let size: number = 4;
    let minLength: number = 3;

    let creatingGame = false;
    function createGame(e: Event) {
        e.preventDefault();
        if (!showNewGameMenu) {
            // this is so the form doesn't submit when cancelling
            return;
        }
        creatingGame = true;
        data.newGame(size, minLength);
    }

</script>

<div>
    <div class="text-xl font-bold">
        Game lobbies
    </div>
    {#if games === undefined}
        <div class="text-xl m-2 italic">
            Loading...
        </div>
    {:else if gameIDs.length === 0}
        <div class="text-xl m-2 italic">
            No active lobbies
        </div>
    {/if}
    <ol class="list-none list-inside">
        {#each gameIDs as gameID}
            <GamePreview id={gameID} game={games[gameID]} />
        {/each}
    </ol>
</div>
<div class="flex flex-col">
    {#if !showNewGameMenu}
        <StyledButton onclick={() => showNewGameMenu = true}>
            Create lobby
        </StyledButton>
    {:else}
        {#if creatingGame}
            <div class="text-xl m-2 italic">
                Creating lobby...
            </div>
        {:else}
            <form class="flex flex-col m-2 p-2 bg-gray-100 rounded-md" on:submit={(e) => createGame(e)} transition:slide >
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
                <div class="flex-row">
                    <StyledButton onclick={() => showNewGameMenu = false}>
                        Cancel
                    </StyledButton>
                    <StyledButton type="submit">
                        Create & join
                    </StyledButton>
                </div>
            </form>
        {/if}
    {/if}

    <StyledButton href="/">Back to home</StyledButton>

</div>