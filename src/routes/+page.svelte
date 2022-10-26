<script lang="ts">
	import type { User } from '$db/models/users';
	import { goto } from '$app/navigation';
	import {
		PUBLIC_HOST_URL,
		PUBLIC_BOT_INVITE,
		PUBLIC_SUPPORT_SERVER_INVITE,
		PUBLIC_COMMUNITY_INVITE,
	} from '$env/static/public';
	import { onMount } from 'svelte';

	import TwoPanel from '$comp/generic/twopanel.svelte';
	import Entry from './leaderboard/entry.svelte';

	import type { PageData } from './$types';
	export let data: PageData;

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

<main>
	<h1 class="text-4xl text-center my-16">Welcome to Elite!</h1>
	<p class="text-body-xl text-center">Look up any skyblock player!</p>

	<div class="flex align-items-center justify-center justify-self-center relative mb-8">
		<form on:submit|preventDefault class="w-10/12 flex align-items-center justify-center">
			<div class="relative inline-block md:w-1/3">
				<input
					class="p-2 m-4 mb-0 text-left border-2 rounded-lg w-[100%] mx-auto"
					bind:value={enteredText}
					maxlength="100"
					placeholder="Search for player"
					type="text"
				/>
			</div>
			<button
				class="p-2 m-4 rounded-lg border-2 border-white dark:border-green-800 bg-green-300 dark:bg-green-600 hover:bg-green-400}"
				on:click={() => {
					goto(`/stats/${enteredText}`);
				}}
			>
				Search
			</button>
		</form>
	</div>

	<TwoPanel>
		<div slot="left" class="m-4 p-4 w-full rounded-lg bg-gray-100 dark:bg-zinc-800">
			<h1 class="p-2 mb-4 w-full text-center bg-gray-200 dark:bg-zinc-700 rounded-md text-xl">
				Join The Discord
			</h1>
			<p class="w-full text-center mb-4">
				Join an exclusive community of Elite Farmers! Full membership only unlocked after reaching 2,500 farming
				weight. For website/bot support, join the support server!
			</p>
			<div class="flex flex-row justify-evenly">
				<a
					href={PUBLIC_SUPPORT_SERVER_INVITE}
					target="_blank"
					class="text-center px-4 py-2 m-2 rounded-md bg-gray-200 hover:bg-gray-400 dark:bg-zinc-700 dark:hover:bg-zinc-900"
					>Join Support Server</a
				>
				<a
					href={PUBLIC_COMMUNITY_INVITE}
					target="_blank"
					class="text-center px-4 py-2 m-2 rounded-md bg-green-400 hover:bg-green-500 dark:bg-green-500 dark:hover:bg-green-700"
					>Join Elite Farmers</a
				>
			</div>
		</div>
		<div slot="right" class="m-4 p-4 w-full flex flex-col justify-between rounded-lg bg-gray-100 dark:bg-zinc-800">
			<h1 class="p-2 mb-4 w-full text-center bg-gray-200 dark:bg-zinc-700 rounded-md text-xl">
				Add To Your Server
			</h1>
			<p class="w-full text-center">
				Quickly access stats and leaderboard in Discord! Elite Bot is verified and already present in more than
				100 servers!
			</p>
			<div class="flex justify-center">
				<a
					href={PUBLIC_BOT_INVITE}
					target="_blank"
					class="text-center px-4 py-2 m-2 rounded-md bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-700"
					>Invite Elite Bot</a
				>
			</div>
		</div>
	</TwoPanel>

	<section class="flex justify-center mt-4 mb-10">
		<div class="flex gap-2 flex-col justify-center w-[90%] sm:w-[70%] md:w-[50%]">
			<h1 class="w-full text-3xl p-4 text-center">Top Farmers</h1>
			{#each data.lb as entry}
				<Entry {entry} jump={undefined} />
			{/each}
			<div class="flex justify-center w-full">
				<a
					href="/leaderboard"
					class="text-center max-w-md px-4 py-2 m-2 rounded-md bg-gray-200 hover:bg-gray-400 dark:bg-zinc-700 dark:hover:bg-zinc-800"
					>View Full Leaderboard</a
				>
			</div>
		</div>
	</section>
</main>
