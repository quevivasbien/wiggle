<script lang="ts">
    import Wiggle from '$components/Wiggle.svelte';
    import Board from '$components/Board.svelte';
    import { onMount, onDestroy } from 'svelte';
    import BoardData from '$scripts/board';
    import { myID } from '$data/stores';
    import StyledButton from '$components/StyledButton.svelte';
    import { base } from '$app/paths';
    import { onValue, ref } from 'firebase/database';
    import { database } from '$scripts/database';

    interface GameData {
        chars: string;
        size: number;
        minLength: number;
        players: string;
        wordsFound?: Record<string, string[]>;
    }

    interface PageData {
        gameID: string;
        gameData: GameData;
        wordsFoundStreamReader: ReadableStreamDefaultReader<string>;
        submitWord: (word: string) => Promise<boolean>;
        quit: () => void;
    }

    export let data: PageData;
    const { gameID, gameData, submitWord, quit } = data;

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
    });

    onDestroy(quit);

    let showAllWords = false;

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

</script>

<Wiggle wiggleSpacing={5000} />

{#if board}
    <Board board={board} formActive={!showAllWords} addWordFound={addWordFound} />
{/if}

{#if wordsFound}
Words found:
<div class="flex flex-row justify-center">
    {#each gameData.players as player, i}
        <div class="flex flex-col basis-40 p-2 m-2 rounded-md {player === $myID ? 'drop-shadow bg-gray-100' : ''}">
            <div class="p-3">
                <div class="text-xl pt-1">Player {i+1}</div>
                {#if player === $myID}
                    <div class="text-sm">(you)</div>
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

<div class="mt-8 mb-4">
    <StyledButton href="{base}/">Quit</StyledButton>
</div>