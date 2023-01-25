<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Entry from './entry.svelte';
	import type { LeaderboardEntry } from '$db/leaderboards';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Head from '$comp/head.svelte';

	export let data: PageData;

	$: firstHalf = data.lb.slice(0, Math.ceil(data.lb.length / 2)) as LeaderboardEntry[];
	$: secondHalf = data.lb.slice(Math.ceil(data.lb.length / 2)) as LeaderboardEntry[];

	const formatting = data.formatting;

	const entry = data.lb.find((e) => e.ign === data.jump && e.cute_name === data.profileName);

	const options: Intl.NumberFormatOptions = {
		maximumFractionDigits: 1,
	};

	if (formatting === 'decimal') {
		options.minimumFractionDigits = 1;
	}

	// Scroll back down to the buttons after navigating to prevent page jumping
	afterNavigate(({ from }) => {
		if (!from?.url.pathname.startsWith('/leaderboard/')) return;
		(document.querySelector('a#navigate') as HTMLAnchorElement)?.focus();
	});

	onMount(async () => {
		if (!$page.url.pathname.includes('+') || !data.userUUID || !data.jump || !data.profileId || !data.profileName)
			return;

		let url = $page.url.pathname
			.replace(`+${data.userUUID}`, `+${data.jump}`)
			.replace(`-${data.profileId}`, `-${data.profileName}`);
		if (!url.includes('-')) url += `-${data.profileName}`;

		if ($page.url.pathname !== url) {
			history.replaceState(history.state, document.title, url + ($page.url.hash ?? ''));
		}
	});
</script>

<Head
	title={entry ? `#${data.playerRank} | ${entry.ign}` : `${data.name} Leaderboard`}
	description={entry
		? `${entry.ign} has ${entry.amount.toLocaleString(undefined, {
				maximumFractionDigits: 0,
		  })} ${data.name}, earning position #${data.playerRank} on the global ${data.name} leaderboard.`
		: `${data.name} Leaderboard for Hypixel Skyblock.`}
/>

<section class="flex flex-col mt-16 justify-center w-full">
	<h1 class="text-4xl text-center my-8">{data.name} Leaderboard</h1>
	<div
		data-sveltekit-preload-data="tap"
		class="flex flex-col lg:flex-row justify-center align-middle rounded-lg my-8 sm:m-8 sm:bg-gray-100 sm:dark:bg-zinc-800"
	>
		<div class="flex flex-col gap-2 p-2 w-full">
			{#each firstHalf as entry, i (entry)}
				<Entry
					rank={i + data.start}
					{entry}
					{formatting}
					highlight={data.jump === entry.ign && data.profileName === entry.cute_name}
				/>
			{/each}
		</div>
		<div class="flex flex-col gap-2 p-2 pt-0 lg:pt-2 w-full">
			{#each secondHalf as entry, i (entry)}
				<Entry
					rank={i + firstHalf.length + data.start}
					{entry}
					{formatting}
					highlight={data.jump === entry.ign && data.profileName === entry.cute_name}
				/>
			{/each}
		</div>
	</div>
	<div class="flex w-full justify-center gap-4 text-center">
		<a
			id="navigate"
			href="/leaderboard/{$page.params.category}/{$page.params.page}/1"
			class="p-3 bg-gray-200 dark:bg-zinc-700 rounded-md w-1/6"
		>
			First
		</a>
		<a
			id="navigate"
			href="/leaderboard/{$page.params.category}/{$page.params.page}/{Math.min(
				Math.max(1, data.start - 20),
				981
			)}"
			class="p-3 bg-gray-300 dark:bg-zinc-600 rounded-md w-1/6"
		>
			Back
		</a>
		<a
			id="navigate"
			href="/leaderboard/{$page.params.category}/{$page.params.page}/{Math.min(
				Math.max(1, data.start + 20),
				981
			)}"
			class="p-3 bg-gray-300 dark:bg-zinc-600 rounded-md w-1/6"
		>
			Next
		</a>
		<a
			id="navigate"
			href="/leaderboard/{$page.params.category}/{$page.params.page}/981"
			class="p-3 bg-gray-200 dark:bg-zinc-700 rounded-md w-1/6"
		>
			Last
		</a>
	</div>
	<h3 class="text-sm text-center w-1/2 mx-auto py-4">
		This leaderboard only consists of the top 1,000 players who have been searched on the website. New entries are
		recalculated every 5 minutes.
	</h3>
</section>
