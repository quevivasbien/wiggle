<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    export let data;
    if (!data.gameData) {
        throw Error("gameData is undefined");
    }
    const { size, minLength } = data.gameData;

    let playersReady: Record<string, boolean>;

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

</script>

<div class="text-lg font-bold">
    {size}x{size} game
</div>
<div>
    Minimum word length: {minLength}
</div>

{#if playersReady === undefined}
    Loading lobby...
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
{/if}