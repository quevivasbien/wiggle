<script lang="ts">
    import { base } from "$app/paths";
    import type { GameData } from "$scripts/multiplayer";

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
    </div>
    <div class="m-2">
        <a class="text-blue-800 hover:text-gray-400" href="{base}/multi-player/lobby/{id}">Join lobby</a>
    </div>
</li>