<script lang="ts">
    import StyledButton from "$components/StyledButton.svelte";
    import Wiggle from "$components/Wiggle.svelte";
    import { base } from "$app/paths";
</script>

<Wiggle wiggleSpacing={2000} />
<div class="font-serif">
    the wiggly word game
</div>

<div class="flex flex-col m-4 p-2 space-y-2">
    <StyledButton href="{base}/single-player">
        Single player
    </StyledButton>
    <StyledButton href="{base}/multi-player">
        Multiplayer
    </StyledButton>
</div>