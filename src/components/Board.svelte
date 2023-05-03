<script lang="ts">
    import type BoardData from "$scripts/board";
    import { compressQu, expandQu } from "$scripts/utils";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";

    export let board: BoardData;
    export let addWordFound: (word: string) => Promise<string | void>;
    export let formActive: boolean = true;

    let textInputField: HTMLInputElement;
    onMount(() => {
        if (formActive) {
            textInputField.focus();
        }
    });

    let wordInput: string = "";
    let path: number[] = [];
    $: updatePath(wordInput);  // update path whenever wordInput changes
    
    function updatePath(wordInput: string) {
        if (!wordInput) {
            path = [];
        }
        else if (pathMatches(wordInput)) {
            // path already works, no need to update
            return;
        }
        else {
            path = board.getPath(compressQu(wordInput.toLowerCase())) ?? [];
        }
    }

    function pathMatches(wordInput: string) {
        const wordOnPath = path.map((i) => board.chars[i]).join("");
        return wordOnPath === wordInput;
    }

    function clickLetter(x: number, y: number) {
        const index = board.toIndex(x, y);
        if (path.length > 0) {
            if (path[path.length - 1] === index) {
                // deselect tile
                path.pop();
                wordInput = wordInput.slice(1, wordInput.length - 1);
                return;
            }
            if (path.includes(index) || !neighbors(index).includes(path[path.length-1])) {
                // already selected or not adjacent to last selection
                return;
            }
        }
        wordInput += expandQu(board.chars[index]);
        path = [...path, index];
    }

    function neighbors(index: number) {
        return [
            index - board.size - 1, index - board.size, index - board.size + 1,
            index - 1, index + 1,
            index + board.size - 1, index + board.size, index + board.size + 1
        ];
    }

    let alertText = "";
    let highlights: number[] = [];

    async function submit(e: Event) {
        e.preventDefault();
        const status = board.checkWord(compressQu(wordInput.toLowerCase()));
        if (status === "ok") {
            const message = await addWordFound(wordInput);
            if (message) {
                setAlert(message);
            }
            setHighlights(path);
            path = [];
        }
        else if (status === "too-short") {
            setAlert("Word is too short (minimum length is " + board.minLength + ")");
        }
        else if (status === "not-word") {
            setAlert("Word not in dictionary");
        }
        else if (status === "not-found") {
            setAlert("Word not found on the board");
        }
        wordInput = "";
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
</script>

<div class="flex flex-col items-center m-2 p-2">
    {#each board.getRows() as row, i}
        <div class="flex flex-row">
            {#each row as cell, j}
                <button
                    class="flex m-1 w-10 h-10 sm:w-12 sm:h-12 sm:text-lg rounded-md drop-shadow items-center justify-center bg-gray-100 capitalize cursor-pointer {path.includes(board.toIndex(j, i)) ? 'font-bold' : 'font-normal'} {highlights.includes(board.toIndex(j, i)) ? 'text-green-500' : ''}"
                    on:click={() => clickLetter(j, i)}
                >
                    {expandQu(cell)}
                </button>
            {/each}
        </div>
    {/each}
</div>

{#if formActive}
    <form on:submit={(e) => submit(e)} out:slide>
        <div class="flex flex-row justify-center">
            <input class="w-2/3 max-w-2xl my-4 p-2 rounded-sm drop-shadow uppercase text-center font-bold" type="text" bind:value={wordInput} bind:this={textInputField} />
            <button type="submit" class="m-4 py-2 px-3 rounded-lg bg-white border-2 hover:border-blue-100 focus:bg-gray-100 drop-shadow-sm">
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