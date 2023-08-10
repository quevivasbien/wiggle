<script lang="ts">
    import { goto } from "$app/navigation";
    import { base } from "$app/paths";
    import StyledButton from "$components/StyledButton.svelte";
    import { user } from "$data/stores";
    import { login } from "$scripts/firebase/auth";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";

    let email: string;
    let pass: string;
    let statusText = "";

    async function submit() {
        if (!email || !pass) {
            return;
        }
        const { error } = await login(email, pass);
        if (error) {
            statusText = "Invalid email and/or password";
        } else {
            goto(`${base}/`);
        }
    }

    onMount(() => {
        if ($user) {
            console.log("Already logged in; navigating to home...");
            goto(`${base}/`);
        }
    });
</script>

<form on:submit|preventDefault={submit} class="">
    <div class="grid grid-cols-3 gap-4 border rounded items-center bg-gray-50 p-4 max-w-md mx-auto">
        <label for="email" class="text-right">Email</label>
        <input
            class="col-span-2 p-2 rounded-sm drop-shadow text-center font-bold"
            type="email"
            placeholder="email@example.com"
            name="email"
            bind:value={email}
        />

        <label for="pass" class="text-right">Password</label>
        <input
            class="col-span-2 p-2 rounded-sm drop-shadow text-center font-bold"
            type="password"
            name="pass"
            bind:value={pass}
        />
    </div>
    <div class="max-w-md mx-auto text-right">
        <StyledButton type="submit">Log in</StyledButton>
    </div>
    {#if statusText}
        <div class="text-red-500 font-bold p-2" transition:slide>
            {statusText}
        </div>
    {/if}
</form>
<div>
    New? <a class="text-blue-800 hover:text-gray-400 hover:underline" href="./register">Create a new account</a>.
</div>

