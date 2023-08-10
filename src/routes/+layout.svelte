<script lang='ts'>
    import "../app.css";
    import { base } from "$app/paths";
    import Wiggle from "$components/Wiggle.svelte";
    import { user, tempDisplayName } from "$data/stores";
    import { logout } from "$scripts/firebase/auth";

    $: displayName = $user?.displayName ?? $tempDisplayName;

</script>

<svelte:head>
    <title>Wiggle</title>
</svelte:head>

<div class="text-center m-4 sm:max-w-2xl mx-auto">
    <div class="pb-2 mb-2 border-b">
        <Wiggle />
        <div class="font-serif">the wiggly word game</div>
    </div>
    <div class="flex flex-row justify-between sm:max-w-lg mx-4 sm:mx-auto text-slate-600">
        <!-- <a href={`${base}/`}>Home</a> -->
        {#if $user}
            <div class="inline-block">Logged in as <span class="font-bold">{displayName}</span></div>
            <a class="text-slate-500 hover:text-gray-400 hover:underline" href={`${base}/`} on:click={logout}>Log out</a>
        {/if}
    </div>
</div>
<div
    class="m-4 sm:mx-auto sm:max-w-xl p-4 content-center text-center items-center rounded-md"
>
    <slot />
</div>

<style lang="postcss">
    :global(.defaultlink) {
        @apply text-blue-800 hover:text-gray-400 hover:underline;
    }
</style>
