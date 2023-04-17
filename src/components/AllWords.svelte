<script lang="ts">
    import { onMount } from "svelte";
    import type { Board } from "$scripts/board";
    import { fade } from "svelte/transition";

    export let board: Board;
    export let wordsFound: string[];
    export let unravelTime: number = 3000;
    export let nDisplayColumns: number = 3;
    
    let allWords: string[] = [];
    let nWordsShown = 0;
    
    let unravelSpacing: number;

    let wordDisplayColumns: string[][] = [];
    for (let i = 0; i < nDisplayColumns; i++) {
        wordDisplayColumns.push([]);
    }

    onMount(() => {
        allWords = board.findAllWords();
        unravelSpacing = unravelTime / allWords.length;
        showNextWord();
    })

    function showNextWord() {
        if (nWordsShown < allWords.length) {
            displayWord(allWords[nWordsShown]);
            nWordsShown++;
            setTimeout(showNextWord, unravelSpacing);
        }
    }

    function displayWord(word: string) {
        const index = nWordsShown % nDisplayColumns;
        wordDisplayColumns[index] = [...wordDisplayColumns[index], word];
    }
</script>

<div>
    All words:
    <div class="flex flex-rowc justify-center">
        {#each wordDisplayColumns as column}
            <div class="flex flex-col basis-40" in:fade>
            {#each column as word}
                <div class="m-1 p-2 rounded-md bg-gray-300 {wordsFound.includes(word) ? 'text-green-500' : 'text-red-500'}">{word}</div>
            {/each}
            </div>
        {/each}
    </div>
    <div class="m-4">
        You found {wordsFound.length} out of {allWords.length} ({((wordsFound.length / allWords.length) * 100).toFixed(1)}%).
    </div>
</div>