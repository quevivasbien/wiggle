<script lang="ts">
    import Board from "../components/Board.svelte";
    import Wiggle from "../components/Wiggle.svelte";
</script>

<div class="m-4 sm:mx-auto sm:max-w-md p-4 content-center text-center items-center bg-gray-200 rounded-md">
    <Wiggle wiggleSpacing={6000} />
    <Board size={5} minLength={4} />
</div>