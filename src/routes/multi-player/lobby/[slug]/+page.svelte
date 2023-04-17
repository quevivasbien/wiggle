<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    
    import { newRandomId } from "$scripts/multiplayer";
    
    let playersReady: Record<string, boolean>;
    const myId = newRandomId();

    // onMount(() => {
    //     const lobbyRef = ref(database, `lobbies/${data.id}`);
    //     get(lobbyRef).then((snapshot) => {
    //         playersReady = snapshot.val() || {};
    //         playersReady[myId] = false;
    //         set(lobbyRef, playersReady);
    //     });
    //     // playersReady syncs automatically with database
    //     onValue(lobbyRef, (snapshot) => {
    //         playersReady = snapshot.val();
    //     });
    // });

    // onDestroy(() => {
    //     // remove this player from the lobby
    //     const lobbyRef = ref(database, `lobbies/${data.id}`);
    //     get(lobbyRef).then((snapshot) => {
    //         playersReady = snapshot.val() || {};
    //         delete playersReady[myId];
    //         set(lobbyRef, playersReady);
    //     });
    // });

    // let ready = false;
    // function syncMyReady() {
    //     if (playersReady === undefined) {
    //         throw Error("playersReady is undefined");
    //     }
    //     if (playersReady[myId] === ready) {
    //         return;
    //     }
    //     const myReadyRef = ref(database, `lobbies/${data.id}/${myId}`);
    //     set(myReadyRef, ready);
    // }
</script>
<!-- 
<div class="text-lg font-bold">
    {data.game.size}x{data.game.size} game
</div>
<div>
    Minimum word length: {data.game.minLength}
</div>

{#if playersReady}
{#each Object.keys(playersReady).reverse() as idx, i}
    {#if idx === myId}
        <div>
            Player {i + 1} (you): <label><input type="checkbox" bind:checked={ready} on:change={syncMyReady}> {ready ? "Ready" : "Not ready"}</label>
        </div>
    {:else}
        <div>
            Player {i + 1}: {playersReady[idx] ? "Ready" : "Not ready"}
        </div>
    {/if}
{/each}
{/if} -->