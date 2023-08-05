<script lang="ts">
    import { slide } from "svelte/transition";
    import { base } from "$app/paths";
    import StyledButton from "$components/StyledButton.svelte";
    import Game from "./Game.svelte";

    let playing = false;

    let size = 4;
    let minLength = 3;
    let timeLimitNumber = 3;
    $: timeLimit = timeLimitNumber === 6 ? null : timeLimitNumber;

    function submitPlay(e: Event) {
        e.preventDefault();
        playing = true;
    }
</script>

{#if !playing}
    <form class="flex flex-col m-2 p-2 bg-gray-100 rounded-md" on:submit={(e) => submitPlay(e)}>
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
        <StyledButton type="submit">Play</StyledButton>
    </form>

    <div class="pt-4 pb-2">
        <StyledButton href="{base}/">
            Back to home
        </StyledButton>
    </div>
{:else}
    <div transition:slide>
        <Game size={size} minLength={minLength} timeLimit={timeLimit} />
    </div>
{/if}