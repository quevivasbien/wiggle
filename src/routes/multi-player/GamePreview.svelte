<script lang="ts">
    import { base } from "$app/paths";
    import { goto } from "$app/navigation";
    import type { GameData } from "$scripts/database";

    export let id: string;
    export let game: GameData;
</script>

<li class="m-2 border border-gray-300 rounded-md">
    <div class="m-2">
        <div class="text-lg font-bold">
            {game.size}x{game.size} game
        </div>
        <div>
            Minimum word length: {game.minLength}
        </div>
        <div>
            Players in lobby: {game.playersInLobby}
        </div>
    </div>
    <div class="m-2">
        <!-- this is a button instead of an <a> so onload page scripts don't get run unless the user actually clicks -->
        <button class="text-blue-800 hover:text-gray-400" on:click={() => goto(`${base}/multi-player/lobby/${id}`)}>Join lobby</button>
    </div>
</li>