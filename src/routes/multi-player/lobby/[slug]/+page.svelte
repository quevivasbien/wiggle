<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount, onDestroy } from "svelte";

    export let data;
    if (!data.gameData) {
        throw Error("gameData is undefined");
    }
    const { size, minLength } = data.gameData;

    let playersReady: Record<string, boolean>;
    $: readyToStart = playersReady && Object.keys(playersReady).length > 1 && Object.values(playersReady).every((ready) => ready);
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
        fetch("/api/lobbies", {
            method: "POST",
            body: JSON.stringify({
                userID: data.myID,
                lobbyID: data.lobbyID,
                action: "ready",
            }),
        });
        // set the local ready state
        ready = true;
    }

    function startGame() {
        goto(`/multi-player/game/${data.lobbyID}/${data.myID}`);
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
    {#each Object.keys(playersReady).reverse() as idx, i}
        {#if idx === data.myID}
            <div>
                Player {i + 1} (you): <label><input type="checkbox" bind:checked={ready} on:change={setReady} disabled={ready}> {ready ? "Ready" : "Not ready"}</label>
            </div>
        {:else}
            <div>
                Player {i + 1}: {playersReady[idx] ? "Ready" : "Not ready"}
            </div>
        {/if}
    {/each}
    {#if readyToStart }
        <div class="m-2 p-2 italic">
            All players are ready! Starting game...
        </div>
    {/if}
{/if}