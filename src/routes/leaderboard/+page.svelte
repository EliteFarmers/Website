<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import Entry from './entry.svelte';

	export let data: PageData;

	let lb = data.lb;
	let start = data.start;
	let jump = data.jump;

	let player = lb.find((entry) => entry.ign === jump);

	let firstHalf = lb.slice(0, Math.ceil(lb.length / 2));
	let secondHalf = lb.slice(Math.ceil(lb.length / 2));

	async function lbPage(index: number) {
		index = Math.max(1, index);

		const request = await fetch(`/api/leaderboard/weight?start=${index}`);
		const data = await request.json();

		history.replaceState(history.state, document.title, `/leaderboard/?start=${index}`);

		lb = data;
		start = index;

		firstHalf = [];
		secondHalf = [];
		setTimeout(() => {
			firstHalf = lb.slice(0, Math.ceil(lb.length / 2));
			secondHalf = lb.slice(Math.ceil(lb.length / 2));
		}, 0);
	}
</script>

<svelte:head>
	<title>Weight Leaderboard</title>

	<meta name="keywords" content="hypixel, skyblock, leaderboard, stats, farming, weight" />
	<meta name="author" content="Kaeso" />

	{#if !data.jump}
		<meta name="description" content="Farming Weight Leaderboard for Hypixel Skyblock" />
		<meta property="og:title" content="Weight Leaderboard" />
		<meta property="og:description" content="Farming Weight Leaderboard for Hypixel Skyblock" />
	{:else if player}
		<meta
			name="description"
			content="{player.ign} has {player.farming
				.weight} farming weight, earning position #{player.rank} on the global weight leaderboard."
		/>
		<meta property="og:title" content="#{player.rank} | {player.ign}" />
		<meta
			property="og:description"
			content="{player.ign} has {player.farming
				.weight} farming weight, earning position #{player.rank} on the global weight leaderboard."
		/>
	{/if}
	<meta property="og:image" content="https://elitebot.dev/favicon.png" />
	<meta property="og:url" content={$page.url.toString()} />
</svelte:head>

<section class="flex flex-col mt-8 justify-center w-full">
	<h1 class="text-2xl text-center">Farming Weight Leaderboard</h1>
	<div class="flex flex-col lg:flex-row justify-center align-middle rounded-lg m-8 bg-gray-100 dark:bg-zinc-800">
		<div class="flex flex-col gap-2 p-2 w-full">
			{#each firstHalf as entry}
				<Entry {entry} {jump} />
			{/each}
		</div>
		<div class="flex flex-col gap-2 p-2 pt-0 lg:pt-2 w-full">
			{#each secondHalf as entry}
				<Entry {entry} {jump} />
			{/each}
		</div>
	</div>
	<div class="flex w-full justify-center gap-4 text-center">
		<button class="p-3 bg-gray-200 dark:bg-zinc-700 rounded-md w-1/6" on:click={() => lbPage(0)}> First </button>
		<button class="p-3 bg-gray-300 dark:bg-zinc-600 rounded-md w-1/6" on:click={() => lbPage(start - 10)}>
			Back
		</button>
		<button class="p-3 bg-gray-300 dark:bg-zinc-600 rounded-md w-1/6" on:click={() => lbPage(start + 10)}>
			Next
		</button>
		<button class="p-3 bg-gray-200 dark:bg-zinc-700 rounded-md w-1/6" on:click={() => lbPage(990)}> Last </button>
	</div>
	<h3 class="text-sm text-center w-1/2 mx-[25%] py-4">
		This leaderboard only consists of the top 1,000 players who have been searched on the website. New entries are
		recalculated every 5 minutes.
	</h3>
</section>
