<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount, onDestroy } from "svelte";
    import { user } from "$data/stores";
    import { base } from "$app/paths";
    import StyledButton from "$components/StyledButton.svelte";
    import { database, type LobbyData } from "$scripts/firebase/config";
    import { onValue, ref } from "firebase/database";

    export let data;
    const { size, minLength, timeLimit } = data.gameData;

    let lobbyData: LobbyData;
    $: allPlayersReady = lobbyData && Object.values(lobbyData.playersReady ?? {}).every((ready) => ready);
    let gameIsStarting = false;

    onMount(async () => {
        // subscribe to lobby updates
        const lobbyRef = ref(database, `lobbies/${data.lobbyID}`);
        onValue(lobbyRef, (snapshot) => {
            lobbyData = snapshot.val() ?? {};
            if (!lobbyData) {
                console.log("lobbyData is null");
                return;
            }
            const playersReady = lobbyData.playersReady ?? {};
            if (Object.keys(playersReady).length > 1 && Object.values(playersReady).every((ready) => ready)) {
                startGame();
            }
        });
    });

    onDestroy(data.exitLobby);

    let ready = false;
    function setReady() {
        if (lobbyData === undefined) {
            throw Error("lobbyData is undefined");
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

{#if lobbyData === undefined}
    <div class="text-xl italic">
        Loading lobby...
    </div>
{/if}
{#if lobbyData}
<div class="p-2 m-2 border border-gray-300">
    <div class="flex flex-col">
        {#each Object.keys(lobbyData.playerNames ?? {}).reverse() as idx, i}
            <div class="flex flex-row space-x-4 justify-center">
                {#if idx === $user?.uid}
                    <div>
                        You:
                    </div>
                    <div>
                        <label><input type="checkbox" bind:checked={ready} on:change={setReady} disabled={ready}> {ready ? "Ready" : "Not ready"}</label>
                    </div>
                {:else}
                    <div>
                        {lobbyData.playerNames ? lobbyData.playerNames[idx] : "Player " + (i + 1)}:
                    </div>
                    <div>
                        {lobbyData.playersReady && lobbyData.playersReady[idx] ? "Ready" : "Not ready"}
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