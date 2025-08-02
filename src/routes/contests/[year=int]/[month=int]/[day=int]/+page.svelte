<script lang="ts">
	import { page } from '$app/state';
	import Head from '$comp/head.svelte';
	import Singlecontest from '$comp/stats/contests/singlecontest.svelte';
	import { appendOrdinalSuffix, getReadableSkyblockDate } from '$lib/format';
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';
	import { Button } from '$ui/button';
	import { SkyBlockTime } from 'farming-weight';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let contests = $derived(data.contests);
	let timestamp = $derived(data.timestamp);
	let date = $derived(new SkyBlockTime((timestamp ?? 0) * 1000));

	const crumbs = $derived<Crumb[]>([
		{
			name: 'Contests',
			href: '/contests',
		},
		{
			name: 'Year ' + date.year,
			href: '/contests/' + date.year,
		},
		{
			name: date.monthName as string,
			href: `/contests/${date.year}/${date.month}`,
		},
		{
			name: appendOrdinalSuffix(date.day),
		},
	]);

	const breadcrumb = getBreadcrumb();
	$effect.pre(() => {
		breadcrumb.setOverride(crumbs);
	});
</script>

<Head
	title="Contests | {getReadableSkyblockDate(timestamp ?? 0)}"
	description="View all known participations of these Jacob contests!"
/>

<div class="flex flex-col items-center justify-center">
	<div class="mt-16 mb-4 flex flex-col gap-4 text-center font-semibold">
		<h1 class="text-4xl">{getReadableSkyblockDate(timestamp ?? 0)}</h1>

		<div class="my-4 flex flex-col justify-center gap-2 md:flex-row md:gap-4">
			<Button
				class="flex-1 rounded-lg p-2"
				variant="secondary"
				href="/contests/{page.params.year}/{page.params.month}/{+page.params.day - 3}">Previous</Button
			>
			<Button
				class="flex-1 rounded-lg p-2"
				variant="secondary"
				href="/contests/{page.params.year}/{page.params.month}">View&nbsp;Month</Button
			>
			<Button
				class="flex-1 rounded-lg p-2"
				variant="secondary"
				href="/contests/{page.params.year}/{page.params.month}/{+page.params.day + 3}">Next</Button
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

	<div class="mx-8 mt-4 mb-16 flex w-full flex-wrap justify-center gap-4 md:flex-row">
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
		<p><strong>??</strong> - The player hasn't claimed this contest yet, their true position is unknown.</p>
		<p>
			<strong>Disclaimer:</strong> These contest participations are collected when a players profile is loaded on the
			website, they aren't automatically scraped. Crops may be missing if no one known to the website has participated
			in the contest, or their profile hasn't been loaded since.
		</p>
	</div>
</div>
