<script lang="ts">
	import { getReadableSkyblockDate } from '$lib/format';
	import type { PageData } from './$types';

	import Head from '$comp/head.svelte';
	import { page } from '$app/stores';
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
	<div class="font-semibold text-center mt-16 mb-4 flex flex-col gap-4">
		<h1 class="text-4xl">{getReadableSkyblockDate(timestamp ?? 0)}</h1>

		<div class="flex flex-col md:flex-row justify-center gap-2 md:gap-4 my-4">
			<a
				class="flex-1 bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg"
				href="/contests/{$page.params.year}/{$page.params.month}/{+$page.params.day - 3}">Previous</a
			>
			<a
				class="flex-1 bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg"
				href="/contests/{$page.params.year}/{$page.params.month}">View&nbsp;Month</a
			>
			<a
				class="flex-1 bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg"
				href="/contests/{$page.params.year}/{$page.params.month}/{+$page.params.day + 3}">Next</a
			>
		</div>
	</div>

	{#if !contests?.length}
		<div class="flex flex-col items-center justify-center p-4 space-y-2 mb-16">
			<h2 class="text-3xl font-semibold text-center">No Contests Found</h2>
			<h4>Try a different timestamp!</h4>
			<p>Data will be loaded once a player has participated in one of these contests!</p>
		</div>
	{/if}

	<div class="flex flex-wrap md:flex-row w-full md:w-[90%] gap-4 mt-4 mx-8 mb-16 justify-center">
		{#each contests ?? [] as contest ((contest.timestamp ?? 0) + (contest.crop ?? ''))}
			<Singlecontest
				timestamp={contest.timestamp ?? 0}
				crop={contest.crop}
				participants={contest.participants}
				entries={contest.participations}
			/>
		{/each}
	</div>

	<div class="max-w-xl mb-8 text-center text-sm flex flex-col gap-4">
		<p><strong>???</strong> - The player hasn't claimed this contest yet, their true position is unknown.</p>
		<p>
			<strong>Disclaimer:</strong> These contest participations are collected when a players profile is loaded on the
			website, they aren't automatically scraped. Crops may be missing if no one known to the website has participated
			in the contest, or their profile hasn't been loaded since.
		</p>
	</div>
</div>
