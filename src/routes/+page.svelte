<script lang="ts">
	import type { User } from "$db/models/users";
	import { goto } from "$app/navigation";
	import { PUBLIC_HOST_URL } from "$env/static/public";
	import { onMount } from "svelte";

	import PlayerCard from "$comp/generic/playercard.svelte";

	let enteredText = '';
	let topViewed: Partial<User>[] = [];

	onMount(async () => {
		const viewed = await fetch(`${PUBLIC_HOST_URL}/api/leaderboard/views`);
		const json = await viewed.json();

		if (viewed.status === 200) {
			topViewed = json;
		}
	});
</script>

<svelte:head>
	<title>Elite</title>
</svelte:head>

<main class="">
	<h1 class="text-4xl text-center my-16">Welcome to Elite!</h1>
	<p class="text-xl text-center">Look up any skyblock player!</p>

	<div class="flex align-items-center justify-center justify-self-center relative">
		<form on:submit|preventDefault class="w-10/12 flex align-items-center justify-center">
			<div class="relative inline-block md:w-1/3">
				<input class="p-2 m-4 mb-0 text-left border-2 rounded-lg w-[100%] mx-auto" 
					bind:value={enteredText} maxlength="100" placeholder="Search for player" type="text"
				/>
			</div>
			<button 
				class="p-2 m-4 rounded-lg border-2 border-white bg-green-300 hover:bg-green-400}"
				on:click={() => { goto(`/stats/${enteredText}`) }}
			>
				Confirm
			</button>
		</form>
	</div>

	<section class="flex justify-center mt-10">
		<div class="grid gap-2 grid-cols-2 md:grid-cols-5 justify-center w-[90%]">
			{#if topViewed.length > 0} {#each topViewed as player}
				<PlayerCard user={player} />
			{/each} {/if}
		</div>
	</section>
</main>

