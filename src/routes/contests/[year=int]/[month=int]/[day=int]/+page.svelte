<script lang="ts">
	import { getReadableSkyblockDate } from '$lib/format';
	import type { PageData } from './$types';

	import Head from '$comp/head.svelte';
	import { page } from '$app/state';
	import Singlecontest from '$comp/stats/contests/singlecontest.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let contests = $derived(data.contests);
	let timestamp = $derived(data.timestamp);
</script>

<Head
	title="Contests | {getReadableSkyblockDate(timestamp ?? 0)}"
	description="View all known participations of these Jacob contests!"
/>

<div class="flex flex-col items-center justify-center">
	<div class="mb-4 mt-16 flex flex-col gap-4 text-center font-semibold">
		<h1 class="text-4xl">{getReadableSkyblockDate(timestamp ?? 0)}</h1>

		<div class="my-4 flex flex-col justify-center gap-2 md:flex-row md:gap-4">
			<a
				class="flex-1 rounded-lg bg-gray-200 p-2 dark:bg-zinc-800"
				href="/contests/{page.params.year}/{page.params.month}/{+page.params.day - 3}">Previous</a
			>
			<a
				class="flex-1 rounded-lg bg-gray-200 p-2 dark:bg-zinc-800"
				href="/contests/{page.params.year}/{page.params.month}">View&nbsp;Month</a
			>
			<a
				class="flex-1 rounded-lg bg-gray-200 p-2 dark:bg-zinc-800"
				href="/contests/{page.params.year}/{page.params.month}/{+page.params.day + 3}">Next</a
			>
		</div>
	</div>

	{#if !contests?.length}
		<div class="mb-16 flex flex-col items-center justify-center space-y-2 p-4">
			<h2 class="text-center text-3xl font-semibold">No Contests Found</h2>
			<h4>Try a different timestamp!</h4>
			<p>Data will be loaded once a player has participated in one of these contests!</p>
		</div>
	{/if}

	<div class="mx-8 mb-16 mt-4 flex w-full flex-wrap justify-center gap-4 md:w-[90%] md:flex-row">
		{#each contests ?? [] as contest ((contest.timestamp ?? 0) + (contest.crop ?? ''))}
			<Singlecontest
				timestamp={contest.timestamp ?? 0}
				crop={contest.crop}
				participants={contest.participants}
				entries={contest.participations}
			/>
		{/each}
	</div>

	<div class="mb-8 flex max-w-xl flex-col gap-4 text-center text-sm">
		<p><strong>???</strong> - The player hasn't claimed this contest yet, their true position is unknown.</p>
		<p>
			<strong>Disclaimer:</strong> These contest participations are collected when a players profile is loaded on the
			website, they aren't automatically scraped. Crops may be missing if no one known to the website has participated
			in the contest, or their profile hasn't been loaded since.
		</p>
	</div>
</div>
