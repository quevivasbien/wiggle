<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount, onDestroy } from "svelte";
    import { myID } from "$data/stores";
    import { base } from "$app/paths";
    import StyledButton from "$components/StyledButton.svelte";

    export let data;
    if (!data.gameData) {
        throw Error("gameData is undefined");
    }
    const { size, minLength } = data.gameData;

    let playersReady: Record<string, boolean>;
    $: allPlayersReady = playersReady && Object.values(playersReady).every((ready) => ready);
    $: readyToStart = allPlayersReady && Object.keys(playersReady).length > 1;
    $: if (readyToStart) {
        setTimeout(startGame, 1000);
    }

    onMount(async () => {
        const reader = data.lobbyStreamReader;
        if (!reader) {
            throw Error("lobbyStreamReader is undefined");
        }
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log("Lobby stream received done signal");
                break;
            }
            console.log("Got value from lobby stream: " + value);
            playersReady = JSON.parse(value);
        }
    });

    onDestroy(() => {
        const exitLobby = data.exitLobby;
        if (!exitLobby) {
            throw Error("tried to exit lobby but exitLobby is undefined");
        }
        exitLobby();
    });

    let ready = false;
    function setReady() {
        if (playersReady === undefined) {
            throw Error("playersReady is undefined");
        }
        // tell the server you're ready
        fetch(`${base}/api/lobbies`, {
            method: "POST",
            body: JSON.stringify({
                userID: $myID,
                lobbyID: data.lobbyID,
                action: "ready",
            }),
        });
        // set the local ready state
        ready = true;
    }

    function startGame() {
        goto(`${base}/multi-player/game/${data.lobbyID}`);
    }

</script>

<div class="text-lg font-bold">
    {size}x{size} game
</div>
<div>
    Minimum word length: {minLength}
</div>

{#if playersReady === undefined}
    <div class="text-xl italic">
        Loading lobby...
    </div>
{/if}
{#if playersReady}
    <div class="flex flex-col p-2 m-2 border border-gray-300">
        {#each Object.keys(playersReady).reverse() as idx, i}
            <div class="flex flex-row space-x-4 justify-center">
                {#if idx === $myID}
                    <div>
                        Player {i + 1} (you):
                    </div>
                    <div>
                        <label><input type="checkbox" bind:checked={ready} on:change={setReady} disabled={ready}> {ready ? "Ready" : "Not ready"}</label>
                    </div>
                {:else}
                    <div>
                        Player {i + 1}:
                    </div>
                    <div>
                        {playersReady[idx] ? "Ready" : "Not ready"}
                    </div>
                {/if}
            </div>
        {/each}
    </div>
    
    
    {#if allPlayersReady && !readyToStart }
        <div class="m-2 p-2 italic">
            Waiting for at least one more player...
        </div>
    {/if}
    {#if readyToStart }
        <div class="m-2 p-2 italic">
            All players are ready! Starting game...
        </div>
    {/if}
{/if}

<div class="mt-8 mb-4">
    <StyledButton href="{base}/multi-player">Exit lobby</StyledButton>
</div>