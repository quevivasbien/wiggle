<script lang="ts">
    export let text: string = "Wiggle";
    export let wiggleSpacing: number = 3000;

    let wiggling = Array(text.length).fill(false);
    
    function setWiggle(i: number) {
        wiggling[i] = true;
        setTimeout(() => {
            wiggling[i] = false;
        }, 500);
        setTimeout(() => {
            setWiggle(i);
        }, 500 + Math.random() * wiggleSpacing);
    }

    for (let i = 0; i < text.length; i++) {
        setTimeout(() => {
            setWiggle(i);
        }, Math.random() * wiggleSpacing);
    }
</script>

<div>
    <div class="text-3xl font-serif">
        {#each text as char, i}
            <span class="inline-block {wiggling[i] ? 'wiggle' : ''}">{char}</span>
        {/each}
    </div>
</div>

<style>
    @keyframes wiggle {
        0% {
            transform: rotate(0deg);
        }
        25% {
            transform: rotate(5deg);
        }
        50% {
            transform: rotate(0deg);
        }
        75% {
            transform: rotate(-5deg);
        }
        100% {
            transform: rotate(0deg);
        }
    }
    .wiggle {
        animation: wiggle 0.5s ease-in-out;
    }
</style>