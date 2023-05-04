<script lang="ts">
    import Wiggle from '$components/Wiggle.svelte';
    import Board from '$components/Board.svelte';
    import { onMount, onDestroy } from 'svelte';
    import BoardData from '$scripts/board';
    import { myID } from '$scripts/database';
    import StyledButton from '$components/StyledButton.svelte';
    import { base } from '$app/paths';
    import { onValue, ref } from 'firebase/database';
    import { database, type ActiveGameData } from '$scripts/database';

    interface PageData {
        gameID: string;
        gameData: ActiveGameData;
        wordsFoundStreamReader: ReadableStreamDefaultReader<string>;
        submitWord: (word: string) => Promise<boolean>;
        quit: () => void;
    }

    export let data: PageData;
    const { gameID, gameData, submitWord, quit } = data;
    const players = gameData.players ? [...gameData.players] : [];  // players in game at beginning

    let board: BoardData;
    let wordsFound: Record<string, string[]>;

    onMount(async () => {
        // set up board
        const { chars, size, minLength } = gameData;
        board = new BoardData(size, chars, minLength);
        // subscribe to game stream
        const wordsFoundRef = ref(database, `activeGames/${gameID}/wordsFound`);
        onValue(wordsFoundRef, (snapshot) => {
            wordsFound = snapshot.val() ?? {};
            console.log("updated wordsFound", wordsFound);
        });
        // subscribe to updates on players in game
        onValue(ref(database, `activeGames/${gameID}/players`), (snapshot) => {
            gameData.players = snapshot.val() ?? [];
            console.log("Updated players in game", gameData.players);
        });
        console.log(`On game page, myID is ${$myID}`);
    });

    onDestroy(quit);

    async function addWordFound(word: string): Promise<string | void> {
        // check if word is in local copy of words found,
        // if not, check on database for approval
        word = word.toLowerCase();
        for (const player in wordsFound) {
            if (wordsFound[player].includes(word)) {
                if (player === $myID) {
                    return 'Word already found';
                }
                else {
                    return 'Word already found by another player';
                }
            }
        }
        let accepted = await submitWord(word);
        if (!accepted) {
            return 'Word already found by another player';
        }
        // word is ok, will be added on database to list of words found
    }

    let secondsRemaining = gameData.timeLimit ? gameData.timeLimit * 60 : null;
    if (secondsRemaining !== null) {
        setInterval(() => {
            if (secondsRemaining === null) {
                throw new Error("secondsRemaining should not be set as null after being non-null");
            }
            if (secondsRemaining > 0) {
                secondsRemaining--;
            }
        }, 1000);
    }

    function winnerMessage() {
        let winner = '';
        let winningWords = 0;
        for (const player in wordsFound) {
            if (wordsFound[player].length > winningWords) {
                winner = player;
                winningWords = wordsFound[player].length;
            }
            else if (wordsFound[player].length === winningWords && player !== winner) {
                winner = ''; // indicates tie
            }
        }
        if (winner === '') {
            return 'It\'s a tie!';
        }
        else {
            return `Player ${players.indexOf(winner) + 1} wins with ${winningWords} words`;
        }
    }
</script>

<Wiggle wiggleSpacing={5000} />

{#if board}
    <Board board={board} addWordFound={addWordFound} formActive={secondsRemaining === null || secondsRemaining > 0} />
{/if}

{#if wordsFound}
<div class="text-lg p-2">
    Words found:
</div>
<div class="flex flex-row flex-wrap justify-center p-y-2 rounded-md border-y-2 border-gray-300 space-y-2">
    {#each players as player, i}
        <div class="flex flex-col flex-auto basis-40 p-2 rounded-md {player === $myID ? 'drop-shadow bg-gray-100' : ''} overflow-y-auto max-h-64 sm:max-h-96">
            <div class="p-3">
                <div class="text-xl pt-1">Player {i+1}</div>
                {#if player === $myID}
                    <div class="text-sm">(you)</div>
                {/if}
                {#if !gameData.players || !gameData.players.includes(player)}
                    <div class="text-sm text-red-900">(quit)</div>
                {/if}
                <div>
                    {(wordsFound[player] ?? []).length} words
                </div>
            </div>
            {#each (wordsFound[player] ?? []) as word}
                <div class="mr-2 m-1 p-2 rounded-md bg-gray-300">{word}</div>
            {/each}
        </div>
    {/each}
</div>
{/if}
{#if secondsRemaining !== null}
    {#if secondsRemaining > 0}
        <div class="text-lg p-2">
            Time remaining: {secondsRemaining} seconds
        </div>
    {:else}
        <div class="text-xl p-2">
            Time's up!
        </div>
        <div class="text-lg">
            {winnerMessage()}
        </div>
    {/if}
{/if}

<div class="mt-8 mb-4">
    <StyledButton href="{base}/">Quit</StyledButton>
</div>