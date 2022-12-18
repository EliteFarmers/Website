<script lang="ts">
	import { page } from "$app/stores";
	import type { PageData } from "./$types";
	import Entry from './entry.svelte';
	import type { LeaderboardEntry } from "$db/leaderboards";
	import { afterNavigate, goto, invalidate } from "$app/navigation";

	export let data: PageData;

	$: firstHalf = data.lb.slice(0, Math.ceil(data.lb.length / 2)) as LeaderboardEntry[];
	$: secondHalf = data.lb.slice(Math.ceil(data.lb.length / 2)) as LeaderboardEntry[];

	const formatting = data.formatting;

	afterNavigate(async () => {
		scroll({ top: 1000 });
	});

	async function lbPage(index: number) {
		index = Math.max(1, index);

		const newPage = $page.url.pathname.replace(/\/\d+$/g, `/${index}`) + ($page.url.search) + $page.url.hash ?? '';
		if (!$page.params.start && isNaN(Number($page.params.page))) {
			await goto(newPage + '/' + index);
		} else {
			await goto(newPage);
		}
	}
</script>


<svelte:head>
	<title>{data.name} Leaderboard</title>

	<meta name="keywords" content="hypixel, skyblock, leaderboard, stats, farming, weight" />
	{#if !data.jump}
		<meta name="description" content="Farming Weight Leaderboard for Hypixel Skyblock." />
		<meta property="og:title" content="Weight Leaderboard" />
		<meta property="og:description" content="Farming Weight Leaderboard for Hypixel Skyblock." />
	<!-- {:else if player}
		<meta
			name="description"
			content="{player.ign} has {player.weight.toLocaleString(undefined, {
				maximumFractionDigits: 0,
			})} farming weight, earning position #{player.rank} on the global weight leaderboard."
		/>
		<meta property="og:title" content="#{player.rank} | {player.ign}" />
		<meta
			property="og:description"
			content="{player.ign} has {player.weight.toLocaleString(undefined, {
				maximumFractionDigits: 0,
			})} farming weight, earning position #{player.rank} on the global weight leaderboard."
		/> -->
	{/if}
	<meta property="og:image" content="https://elitebot.dev/favicon.png" />
	<meta property="og:url" content={$page.url.toString()} />
</svelte:head>

<section class="flex flex-col mt-16 justify-center w-full">
	<h1 class="text-4xl text-center my-8">{data.name} Leaderboard</h1>
	<div
		class="flex flex-col lg:flex-row justify-center align-middle rounded-lg my-8 sm:m-8 sm:bg-gray-100 sm:dark:bg-zinc-800"
	>
		<div class="flex flex-col gap-2 p-2 w-full">
			{#each firstHalf as entry, i (entry)}
				<Entry rank={i + data.start} {entry} jump={data.jump} {formatting} />
			{/each}
		</div>
		<div class="flex flex-col gap-2 p-2 pt-0 lg:pt-2 w-full">
			{#each secondHalf as entry, i (entry)}
				<Entry rank={i + firstHalf.length + data.start} {entry} jump={data.jump} {formatting} />
			{/each}
		</div>
	</div>
	<div class="flex w-full justify-center gap-4 text-center">
		<button class="p-3 bg-gray-200 dark:bg-zinc-700 rounded-md w-1/6" on:click={() => lbPage(0)}> First </button>
		<button class="p-3 bg-gray-300 dark:bg-zinc-600 rounded-md w-1/6" on:click={() => lbPage(data.start - 20)}>
			Back
		</button>
		<button class="p-3 bg-gray-300 dark:bg-zinc-600 rounded-md w-1/6" on:click={() => lbPage(data.start + 20)}>
			Next
		</button>
		<button class="p-3 bg-gray-200 dark:bg-zinc-700 rounded-md w-1/6" on:click={() => lbPage(990)}> Last </button>
	</div>
	<h3 class="text-sm text-center w-1/2 mx-[25%] py-4">
		This leaderboard only consists of the top 1,000 players who have been searched on the website. New entries are
		recalculated every 5 minutes.
	</h3>
</section>