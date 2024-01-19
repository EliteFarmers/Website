<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Entry from '$comp/leaderboards/entry.svelte';
	import { afterNavigate } from '$app/navigation';
	import Head from '$comp/head.svelte';
	import type { LeaderboardEntry } from '$lib/api/elite';

	export let data: PageData;

	$: title = `${data.lb?.title} Leaderboard`;
	$: entries = data.lb?.entries ?? [];
	$: offset = (data.lb?.offset ?? 0) + 1;

	$: firstHalf = entries.slice(0, Math.ceil(entries.length / 2)) as LeaderboardEntry[];
	$: secondHalf = entries.slice(Math.ceil(entries.length / 2)) as LeaderboardEntry[];
	$: formatting = data.formatting;

	$: {
		if (data.lb?.id === 'skyblockxp') {
			entries = entries.map((entry) => ({
				ign: entry.ign,
				profile: entry.profile,
				amount: (entry.amount ?? 0) / 100,
			}));
		}
	}

	// Scroll back down to the buttons after navigating to prevent page jumping
	afterNavigate(({ from }) => {
		if (!from?.url.pathname.startsWith('/leaderboard/')) return;
		(document.querySelector('a#navigate') as HTMLAnchorElement)?.focus();
	});
</script>

<Head {title} description={`${title} for Hypixel Skyblock.`} />

<section class="flex flex-col mt-16 justify-center w-full">
	<h1 class="text-4xl text-center my-8">{title}</h1>
	<div
		data-sveltekit-preload-data="tap"
		class="flex flex-col lg:flex-row justify-center align-middle rounded-lg my-8 sm:m-8"
	>
		<div class="flex flex-col gap-2 p-2 w-full">
			{#each firstHalf as entry, i (entry)}
				<Entry rank={i + offset} {entry} {formatting} />
			{/each}
		</div>
		<div class="flex flex-col gap-2 p-2 pt-0 lg:pt-2 w-full">
			{#each secondHalf as entry, i (entry)}
				<Entry rank={i + firstHalf.length + offset} {entry} {formatting} />
			{/each}
		</div>
	</div>
	<div class="flex w-full justify-center gap-4 text-center">
		<a
			id="navigate"
			href="/leaderboard/{$page.params.category}/1"
			class="p-3 bg-gray-200 dark:bg-zinc-700 rounded-md w-1/6"
		>
			First
		</a>
		<a
			id="navigate"
			href="/leaderboard/{$page.params.category}/{Math.min(
				Math.max(1, +($page.params.start ?? 1) - 20),
				$page.data.leaderboard.limit - 19
			)}"
			class="p-3 bg-gray-300 dark:bg-zinc-600 rounded-md w-1/6"
		>
			Back
		</a>
		<a
			id="navigate"
			href="/leaderboard/{$page.params.category}/{Math.min(
				Math.max(1, +($page.params.start ?? 1) + 20),
				$page.data.leaderboard.limit - 19
			)}"
			class="p-3 bg-gray-300 dark:bg-zinc-600 rounded-md w-1/6"
		>
			Next
		</a>
		<a
			id="navigate"
			href="/leaderboard/{$page.params.category}/{$page.data.leaderboard.limit - 19}"
			class="p-3 bg-gray-200 dark:bg-zinc-700 rounded-md w-1/6"
		>
			Last
		</a>
	</div>
	<h3 class="text-sm text-center w-1/2 mx-auto py-4">
		This leaderboard only consists of the top {$page.data.leaderboard.limit.toLocaleString()} players who have been searched
		on this website. New entries are recalculated every 10 minutes.
	</h3>
</section>
