<script lang="ts">
    import { goto } from "$app/navigation";
    import { base } from "$app/paths";
    import StyledButton from "$components/StyledButton.svelte";
    import { user } from "$data/stores";
    import { register } from "$scripts/firebase/auth";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";

    let uname: string;
    let email: string;
    let pass: string;
    let passConfirm: string;
    let statusText = "";

    const MAX_UNAME_LENGTH = 15;

    async function submit() {
        if (!email || !pass) {
            return;
        }
        if (pass != passConfirm) {
            statusText = "Password does not match";
            return;
        }
        if (uname.length > MAX_UNAME_LENGTH) {
            statusText = `Username must be ${MAX_UNAME_LENGTH} characters or less`;
            return;
        }
        const { error } = await register(uname, email, pass);
        if (error) {
            statusText = "Invalid username and/or password";
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
    <div
        class="grid grid-cols-3 gap-4 border rounded items-center bg-gray-50 p-4 max-w-md mx-auto"
    >
        <label for="uname" class="text-right">Username</label>
        <input
            class="col-span-2 p-2 rounded-sm drop-shadow text-center font-bold"
            type="uname"
            placeholder="user123"
            name="uname"
            bind:value={uname}
        />

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

        <label for="passConfirm" class="text-right">Confirm password</label>
        <input
            class="col-span-2 p-2 rounded-sm drop-shadow text-center font-bold"
            type="password"
            name="passConfirm"
            bind:value={passConfirm}
        />
    </div>
    <div class="max-w-md mx-auto text-right">
        <StyledButton type="submit">Sign up</StyledButton>
    </div>
    {#if statusText}
        <div class="text-red-500 font-bold p-2" transition:slide>
            {statusText}
        </div>
    {/if}
</form>
<div>
    Already have an account? <a class="defaultlink" href="./login">Sign in</a>.
</div>
