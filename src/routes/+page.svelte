<script lang="ts">
    import StyledButton from "$components/StyledButton.svelte";
import Wiggle from "$components/Wiggle.svelte";
</script>

<Wiggle wiggleSpacing={2000} />
<div class="font-serif">
    the wiggly word game
</div>

<div class="flex flex-col m-4 p-2 space-y-2">
    <StyledButton href="/single-player">
        Single player
    </StyledButton>
    <StyledButton href="multi-player">
        Multiplayer
    </StyledButton>
</div>