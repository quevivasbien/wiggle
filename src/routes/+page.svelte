<script lang="ts">
    import Wiggle from "$components/Wiggle.svelte";
</script>

<Wiggle wiggleSpacing={2000} />
<div class="font-serif">
    the wiggly word game
</div>

<div class="flex flex-col m-4 p-2 space-y-2">
    <a href="/single-player" class="w-1/3 mx-auto my-4 py-2 px-3 rounded-lg bg-white border-2 hover:border-blue-100 focus:bg-gray-100 drop-shadow">Single player</a>
    <a href="/multi-player" class="w-1/3 mx-auto my-4 py-2 px-3 rounded-lg bg-white border-2 hover:border-blue-100 focus:bg-gray-100 drop-shadow">Multiplayer</a>
</div>