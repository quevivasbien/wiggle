<script lang="ts">
    import Wiggle from '$components/Wiggle.svelte';
    import Board from '$components/Board.svelte';
    import { onMount, onDestroy } from 'svelte';
    import BoardData from '$scripts/board';

    interface GameData {
        chars: string;
        size: number;
        minLength: number;
        players: string;
        wordsFound?: Record<string, string[]>;
    }

    interface PageData {
        gameID: string;
        myID: string;
        gameData: GameData;
        wordsFoundStreamReader: ReadableStreamDefaultReader<string>;
        submitWord: (word: string) => Promise<boolean>;
    }

    export let data: PageData;
    const { gameID, myID, gameData, wordsFoundStreamReader, submitWord } = data;

    let board: BoardData;
    let wordsFound: Record<string, string[]>;

    onMount(async () => {
        // set up board
        const { chars, size, minLength } = gameData;
        board = new BoardData(size, chars, minLength);
        // subscribe to game stream
        while (true) {
            const { done, value } = await wordsFoundStreamReader.read();
            if (done) {
                console.log('Game stream received done signal');
                break;
            }
            console.log('Got value from game stream: ' + value);
            wordsFound = JSON.parse(value);
        }
    });

    onDestroy(() => {
        wordsFoundStreamReader.cancel();
    });

    let showAllWords = false;

    async function addWordFound(word: string): Promise<string | void> {
        // check if word is in local copy of words found,
        // if not, send to server for approval
        word = word.toLowerCase();
        for (const player in wordsFound) {
            if (wordsFound[player].includes(word)) {
                if (player === myID) {
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
        // word is ok, will be added by server to list of words found
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
        <div class="flex flex-col basis-40 p-2 m-2 rounded-md {player === myID ? 'drop-shadow bg-gray-100' : ''}">
            <div class="text-xl p-3">Player {i+1}{player === myID ? " (you)": ""}</div>
            {#each (wordsFound[player] ?? []) as word}
                <div class="mr-2 m-1 p-2 rounded-md bg-gray-300">{word}</div>
            {/each}
        </div>
    {/each}
</div>
{/if}