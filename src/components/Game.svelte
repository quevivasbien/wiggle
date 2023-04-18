<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import Board from "$scripts/board";
    import { compressQu, expandQu } from "$scripts/utils";
    import { slide } from "svelte/transition";
    import AllWords from "$components/AllWords.svelte";
    import StyledButton from "./StyledButton.svelte";

    export let size: number;
    export let minLength: number;
    export let focus: boolean = true;

    let board: Board;
    let textInputField: HTMLInputElement;
    onMount(() => {
        board = Board.random(size, minLength);
        if (focus) {
            textInputField.focus();
        }
    });

    let wordInput: string = "";
    let path: number[] = [];
    // when wordInput changes, update path
    $: {
        if (board) {
            if (!wordInput) {
                path = [];
            }
            path = board.getPath(compressQu(wordInput.toLowerCase())) || [];
        }
    }

    function clickLetter(x: number, y: number) {
        const index = board.toIndex(x, y);
        wordInput += expandQu(board.chars[index]);
    }

    let wordsFound: string[] = [];
    let alertText = "";
    let highlights: number[] = [];

    function submit(e: Event) {
        e.preventDefault();
        if (showAllWords) {
            return;
        }
        const status = board.checkWord(compressQu(wordInput.toLowerCase()));
        if (status === "ok") {
            addWordFound(wordInput);
            setHighlights(path);
            path = [];
        }
        else if (status === "too-short") {
            setAlert("Word is too short (minimum length is " + minLength + ")");
        }
        else if (status === "not-word") {
            setAlert("Word not in dictionary");
        }
        else if (status === "not-found") {
            setAlert("Word not found on the board");
        }
        wordInput = "";
    }

    function addWordFound(word: string) {
        word = word.toLowerCase();
        if (!wordsFound.includes(word)) {
            wordsFound = [...wordsFound, word];
        }
        else {
            setAlert("Word already found");
        }
    }

    function setHighlights(path: number[]) {
        highlights = path;
        setTimeout(() => {
            highlights = [];
        }, 1000);
    }

    function setAlert(text: string) {
        alertText = text;
        setTimeout(() => {
            alertText = "";
        }, 1000);
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

<div class="flex flex-col items-center m-2 p-2">
    <div class="flex flex-col">
        {#if board}
        {#each board.getRows() as row, i}
            <div class="flex flex-row">
                {#each row as cell, j}
                    <button class="flex m-1 w-10 h-10 border border-gray-400 rounded-md drop-shadow-sm items-center justify-center bg-gray-100 capitalize cursor-pointer {path.includes(board.toIndex(j, i)) ? 'font-bold' : 'font-normal'} {highlights.includes(board.toIndex(j, i)) ? 'text-green-500' : ''}" on:click={() => clickLetter(j, i)}>
                        {expandQu(cell)}
                    </button>
                {/each}
            </div>
        {/each}
        {/if}
    </div>
    {#if !showAllWords}
    <form on:submit={(e) => submit(e)} out:slide>
        <div class="flex flex-row justify-center">
            <input class="w-2/3 max-w-2xl my-4 p-2 rounded-sm drop-shadow uppercase text-center font-bold" type="text" bind:value={wordInput} bind:this={textInputField} />
            <button type="submit" class="m-4 py-2 px-3 rounded-lg bg-white border-2 hover:border-blue-100 focus:bg-gray-100 drop-shadow">
                &#10132;
            </button>
        </div>
    </form>
    {/if}
    {#if alertText}
    <div class="text-red-500 font-bold p-2" transition:slide>
        {alertText}
    </div>
    {/if}
</div>
    {#if showAllWords}
        <!-- shown if game is done-->
        <AllWords board={board} wordsFound={wordsFound} />
        <div class="mt-8">
            <StyledButton href="/">New game</StyledButton>
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