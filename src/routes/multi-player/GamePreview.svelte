<script lang="ts">
    import { base } from "$app/paths";
    import type { GameData } from "$scripts/firebase/config";

    export let id: string;
    export let game: GameData;
</script>

<li class="m-2 border border-gray-300 rounded-md">
    <div class="m-2">
        <div class="text-lg uppercase font-bold">
            {game.name}
        </div>
        <div>
            Size: {game.size}x{game.size}
        </div>
        <div>
            Minimum word length: {game.minLength}
        </div>
        <div>
            Players in lobby: {game.playersInLobby}
        </div>
        <div>
            Time limit: {game.timeLimit ? game.timeLimit + (game.timeLimit === 1 ? ' minute' : ' minutes') : 'no time limit'}
        </div>
    </div>
    <div class="m-2">
        <a class="text-blue-800 hover:text-gray-400 hover:underline" href={`${base}/multi-player/lobby/${id}`}>Join lobby</a>
    </div>
</li>