<script lang="ts">
    import { page } from "$app/stores";
    import { base } from "$app/paths";
    import StyledButton from "$components/StyledButton.svelte";
</script>

<div class="text-lg">
    {$page.status}
</div>
{#if $page.error}
    <div>
        {$page.error.message}
    </div>
{/if}

<div class="my-8">
    <StyledButton href="{base}/">Back to home</StyledButton>
</div>