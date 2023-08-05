<script lang="ts">
    import StyledButton from "$components/StyledButton.svelte";
    import { base } from "$app/paths";
    import { user } from "$data/stores";
</script>

<div class="flex flex-col space-y-2">
    <StyledButton href="{base}/single-player">
        Single player
    </StyledButton>
    {#if $user}
    <StyledButton href="{base}/multi-player">
        Multiplayer
    </StyledButton>
    {:else}
        <div><a class="defaultlink" href={`${base}/auth/login`}>Log in</a> to play a multiplayer game</div>
    {/if}
</div>
