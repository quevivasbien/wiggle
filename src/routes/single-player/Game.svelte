<!-- a single-player game -->
<script lang="ts">
    import { onMount } from "svelte";
    import BoardData from "$scripts/board";
    import AllWords from "$components/AllWords.svelte";
    import StyledButton from "$components/StyledButton.svelte";
    import Board from "$components/Board.svelte";
    import { base } from "$app/paths";

    export let size: number;
    export let minLength: number;
    export let timeLimit: number | null;

    let board: BoardData;
    onMount(() => {
        board = BoardData.random(size, minLength);
    });

    let wordsFound: string[] = [];

    async function addWordFound(word: string): Promise<string | void> {
        word = word.toLowerCase();
        if (!wordsFound.includes(word)) {
            wordsFound = [...wordsFound, word];
        }
        else {
            return "Word already found";
        }
    }

    function splitWordsFound(nColumns: number) {
        // split words found into columns
        const words: string[][] = [];
        for (let i = 0; i < nColumns; i++) {
            words.push([]);
        }
        for (let i = 0; i < wordsFound.length; i++) {
            const index = i % nColumns;
            words[index].push(wordsFound[wordsFound.length - i - 1]);
        }
        return words;
    }

    let showAllWords = false;
    let outOfTime = false;

    let secondsRemaining = timeLimit === null ? null : timeLimit * 60;
    if (secondsRemaining !== null) {
        setInterval(() => {
            if (secondsRemaining === null) {
                throw new Error("secondsRemaining should not be set as null after being non-null");
            }
            if (showAllWords) {
                return;
            }
            secondsRemaining--;
            if (secondsRemaining <= 0) {
                outOfTime = true;
                showAllWords = true;
            }
        }, 1000);
    }
</script>

{#if board}
    <Board board={board} addWordFound={addWordFound} formActive={!showAllWords} />
{/if}

{#if showAllWords}
    <!-- shown if game is done-->
    {#if outOfTime}
        <div class="text-lg m-2">
            Out of time!
        </div>
    {/if}
    <AllWords board={board} wordsFound={wordsFound} />
    <div class="mt-8">
        <StyledButton href="{base}/">New game</StyledButton>
    </div>
{:else}
    <!-- shown during game -->
    {#if wordsFound.length > 0}
    <div>
        <div class="text-lg m-2">
            Words found ({wordsFound.length}):
        </div>
        <div class="p-2 rounded-md border-b-2 border-gray-300 bg-gray-100">
            <div class="flex flex-row justify-center overflow-y-auto max-h-64 sm:max-h-96 p-2">
                {#each splitWordsFound(Math.min(wordsFound.length, 3)) as column}
                    <div class="flex flex-col basis-40">
                    {#each column as word}
                        <div class="m-1 p-2 rounded-md bg-gray-300">{word}</div>
                    {/each}
                    </div>
                {/each}
            </div>
        </div>
        
    </div>
    {/if}
    {#if secondsRemaining !== null}
        <div class="text-lg m-2">
            Time remaining: {Math.floor(secondsRemaining / 60)}:{secondsRemaining % 60 < 10 ? "0" : ""}{secondsRemaining % 60}
        </div>
    {/if}
    <div class="mt-8">
        <StyledButton onclick={() => showAllWords = true}>Show solutions</StyledButton>
    </div>
{/if}