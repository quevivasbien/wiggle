<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount, onDestroy } from "svelte";
    import { myID } from "$scripts/database";
    import { base } from "$app/paths";
    import StyledButton from "$components/StyledButton.svelte";
    import { database } from "$scripts/database.js";
    import { onValue, ref } from "firebase/database";

    export let data;
    const { size, minLength, timeLimit } = data.gameData;

    let playersReady: Record<string, boolean>;
    $: allPlayersReady = playersReady && Object.values(playersReady).every((ready) => ready);
    let gameIsStarting = false;

    onMount(async () => {
        // subscribe to lobby updates
        const lobbyRef = ref(database, `lobbies/${data.lobbyID}`);
        onValue(lobbyRef, (snapshot) => {
            playersReady = snapshot.val() ?? {};
            if (!playersReady) {
                console.log("playersReady is null");
                return;
            }
            if (Object.keys(playersReady).length > 1 && Object.values(playersReady).every((ready) => ready)) {
                startGame();
            }
        });
        console.log(`On lobby page, myID is ${$myID}`);
    });

    onDestroy(data.exitLobby);

    let ready = false;
    function setReady() {
        if (playersReady === undefined) {
            throw Error("playersReady is undefined");
        }
        // update database ready state
        data.setReady();
        // set the local ready state
        ready = true;
    }

    function startGame() {
        gameIsStarting = true;
        // update database to indicate game start
        data.startGame();
        // wait 1s, then navigate to game page
        setTimeout(() => {
            goto(`${base}/multi-player/game/${data.lobbyID}`);
        }, 1000);
    }

</script>

<div class="text-lg font-bold">
    {size}x{size} game
</div>
<div>
    Minimum word length: {minLength}
</div>
<div>
    Time limit: {timeLimit ? `${timeLimit} ${timeLimit === 1 ? "minute" : "minutes"}` : "None"}
</div>

{#if playersReady === undefined}
    <div class="text-xl italic">
        Loading lobby...
    </div>
{/if}
{#if playersReady}
<div class="p-2 m-2 border border-gray-300">
    <div class="flex flex-col">
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
    
    
    {#if allPlayersReady && !gameIsStarting }
        <div class="m-2 p-2 italic">
            Waiting for at least one more player...
        </div>
    {/if}
    {#if gameIsStarting }
        <div class="m-2 p-2 italic">
            All players are ready! Starting game...
        </div>
    {/if}
</div>
{/if}

<div class="mt-8 mb-4">
    <StyledButton href="{base}/multi-player">Exit lobby</StyledButton>
</div>