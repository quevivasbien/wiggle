<script lang="ts">
    export let href: string | undefined = undefined;
    export let type: "submit" | undefined = undefined;
    export let onclick: (() => void) | undefined = undefined;
</script>

{#if href !== undefined}
    <a href={href} class="font-bold text-gray-700 sm:w-1/3 mx-auto my-4 py-2 px-3 rounded-lg bg-white border hover:border-blue-100 focus:bg-gray-100 drop-shadow-sm">
        <slot />
    </a>
{:else}
    <button type={type} on:click={onclick} class="font-bold text-gray-700 sm:w-1/3 mx-auto my-4 py-2 px-3 rounded-lg bg-white border hover:border-blue-100 focus:bg-gray-100 drop-shadow-sm">
        <slot />
    </button>
{/if}