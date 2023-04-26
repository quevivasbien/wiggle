<!-- a single-player game -->
<script lang="ts">
    import { onMount } from "svelte";
    import BoardData from "$scripts/board";
    import AllWords from "$components/AllWords.svelte";
    import StyledButton from "./StyledButton.svelte";
    import Board from "./Board.svelte";
    import { base } from "$app/paths";

    export let size: number;
    export let minLength: number;

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
</script>

{#if board}
    <Board board={board} addWordFound={addWordFound} formActive={!showAllWords} />
{/if}

{#if showAllWords}
    <!-- shown if game is done-->
    <AllWords board={board} wordsFound={wordsFound} />
    <div class="mt-8">
        <StyledButton href="{base}/">New game</StyledButton>
    </div>
{:else}
    <!-- shown during game -->
    {#if wordsFound.length > 0}
    <div>
        Words found ({wordsFound.length}):
        <div class="flex flex-row justify-center">
            {#each splitWordsFound(Math.min(wordsFound.length, 3)) as column}
                <div class="flex flex-col basis-40">
                {#each column as word}
                    <div class="m-1 p-2 rounded-md bg-gray-300">{word}</div>
                {/each}
                </div>
            {/each}
        </div>
    </div>
    {/if}
    <div class="mt-8">
        <StyledButton onclick={() => showAllWords = true}>Show solutions</StyledButton>
    </div>
{/if}