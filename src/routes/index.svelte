<!-- <script context="module" lang="ts">
	import type { LoadEvent } from '@sveltejs/kit';

	export async function load(event: LoadEvent) {
		console.log(event.props, event.params, event.status);
	}
</script> -->

<script lang="ts">
	import { goto } from "$app/navigation";
	import { session } from "$app/stores";

	let enteredText = '';

	// if ($session.user === undefined) {
	// 	let user = undefined;

	// 	const drequest = await fetch(`${DISCORD_API_URL}/users/@me`, {
	// 		headers: { 'Authorization': `Bearer ${response.access_token}`}
	// 	});

	// 	// returns a discord user if JWT was valid
	// 	const dresponse = await drequest.json();

	// 	if (dresponse.id) {
	// 		user = dresponse;
	// 	}
	// } 
</script>

<svelte:head>
	<title>Sky Viewer</title>
</svelte:head>

<main class="">
	<h1 class="text-4xl text-center my-16">Welcome to Sky Viewer!</h1>
	<p class="text-xl text-center">Look up any skyblock player!</p>

	<div class="flex align-items-center justify-center justify-self-center relative">
		<form on:submit|preventDefault class="w-10/12 flex align-items-center justify-center">
			<div class="relative inline-block w-1/3">
				<input class="p-2 m-4 mb-0 text-left border-2 rounded-lg w-[100%] mx-auto" 
					bind:value={enteredText} maxlength="100" placeholder="Search for player" type="text"
				/>
			</div>
			<button 
				class="p-2 m-4 rounded-lg border-2 border-white bg-green-300 hover:bg-green-400}"
				on:click={() => { goto(`/user/${enteredText}`) }}
			>
				Confirm
			</button>
		</form>
	</div>
</main>

