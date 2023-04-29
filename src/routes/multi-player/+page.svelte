<script lang="ts">
    // disable pre-loading
    import { setContext } from "svelte";
    setContext("preload", null);

    import { onMount } from "svelte";
    import GamePreview from "./GamePreview.svelte";
    import { slide } from "svelte/transition";
    import StyledButton from "$components/StyledButton.svelte";
    import { base } from "$app/paths";
    import BoardData from "$scripts/board";
    import { newRandomID } from "$scripts/utils";
    import { get, onValue, ref, set } from "firebase/database";
    import { database, type ActiveGameData, type GameData } from "$scripts/database";
    import { goto } from "$app/navigation";

    let games: Record<string, GameData>;
    $: gameIDs = games ? Object.keys(games) : [];

    onMount(async () => {
        // subscribe to games state updates
        const gamesRef = ref(database, "games");
        onValue(gamesRef, (snapshot) => {
            games = snapshot.val() ?? {};
            removeExpiredGames();
            console.log("Received games update: ", games);
        });
    });

    function removeExpiredGames() {
        // remove games that have been in the database for more than 12 hours
        // or have no players in lobby & have been in the database for more than 1 minute
        const now = Date.now();
        for (const id in games) {
            const game = games[id];
            const expired = (game.playersInLobby === 0 && now - game.creationTime > 60 * 1000)
                || now - game.creationTime > 12 * 60 * 60 * 1000;
            if (expired) {
                console.log(`Removing expired game ${id}`);
                // remove game from database
                const gameRef = ref(database, "games/" + id);
                set(gameRef, null);
                // remove corresponding lobby
                const lobbyRef = ref(database, "lobbies/" + id);
                set(lobbyRef, null);
            }
        }
        // do the same thing with activeGames
        const activeGamesRef = ref(database, "activeGames");
        get(activeGamesRef).then((snapshot) => {
            const activeGames: Record<string, ActiveGameData> = snapshot.val() ?? {};
            for (const id in activeGames) {
                const game = activeGames[id];
                const expired = now - game.timeStarted > 12 * 60 * 60 * 1000;
                if (expired) {
                    console.log(`Removing expired active game ${id}`);
                    // remove game from database
                    const gameRef = ref(database, "activeGames/" + id);
                    set(gameRef, null);
                }
            }
        });
    }

    async function newGame(size: number, minLength: number, timeLimit: number | null) {
        const board = BoardData.random(size, minLength);
        // get a new unique id
        let id = '';
        do {
            id = newRandomID();
        } while ((await get(ref(database, 'games/' + id))).exists());
        // add the game to the database
        const gameRef = ref(database, 'games/' + id);
        const gameData = {
            size: board.size,
            chars: board.chars,
            minLength: board.minLength,
            creationTime: Date.now(),
            playersInLobby: 0,
            timeLimit,
        };
        await set(gameRef, gameData);
        // join the new lobby
        goto(`${base}/multi-player/lobby/${id}`);
    }

    let showNewGameMenu = false;
    let size: number = 4;
    let minLength: number = 3;
    let timeLimitNumber: number = 3;
    $: timeLimit = timeLimitNumber === 6 ? null : timeLimitNumber;

    let creatingGame = false;
    function createGame(e: Event) {
        e.preventDefault();
        if (!showNewGameMenu) {
            // this is so the form doesn't submit when cancelling
            return;
        }
        creatingGame = true;
        newGame(size, minLength, timeLimit);
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
                <label class="p-2" for="timeLimitNumber">
                    <div class="p-3">
                        Time limit:
                    </div>
                    <div class="flex flex-row justify-center">
                        <input class="w-1/3 accent-gray-500" type="range" min="1" max="6" bind:value={timeLimitNumber} />
                        <div class="px-3">
                            {timeLimit === null ? 'no time limit' : timeLimit + (timeLimit === 1 ? ' minute' : ' minutes')}
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

    <StyledButton href="{base}/">Back to home</StyledButton>

</div>