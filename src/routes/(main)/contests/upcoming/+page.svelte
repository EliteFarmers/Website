<script lang="ts">
	import Head from '$comp/seo/head.svelte';
	import CropSelector from '$comp/stats/contests/crop-selector.svelte';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { getAnyCropSelected, getSelectedCrops } from '$lib/stores/selectedCrops';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Upcoming from './upcoming.svelte';

	const CONTEST_DURATION_SECONDS = 20 * 60;
	type ContestEntry = [timestamp: string, crops: string[]];

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let contests = $derived(
		(Object.entries((data.contests ?? {}) as Record<number, string[]>) as ContestEntry[])
			.map(([timestamp, crops]) => [timestamp, [...crops].sort((a, b) => a.localeCompare(b))] as ContestEntry)
			.sort(([a], [b]) => Number(a) - Number(b))
	);
	let seconds = $state(Math.floor(Date.now() / 1000));

	let current = $derived(
		contests.find(
			([timestamp]) => Number(timestamp) <= seconds && seconds < Number(timestamp) + CONTEST_DURATION_SECONDS
		)
	);
	let upcoming = $derived(contests.filter(([timestamp]) => Number(timestamp) > seconds));

	let selected = getSelectedCrops();
	let anySelected = getAnyCropSelected();

	function matchesCropFilter(crops: string[]): boolean {
		return !$anySelected || crops.some((crop) => $selected[crop]);
	}

	let visibleCurrent = $derived(current && matchesCropFilter(current[1]) ? current : undefined);
	let visibleUpcoming = $derived(upcoming.filter(([, crops]) => matchesCropFilter(crops)));
	let hasContestData = $derived(current !== undefined || upcoming.length > 0);
	let hasVisibleData = $derived(visibleCurrent !== undefined || visibleUpcoming.length > 0);

	onMount(() => {
		const interval = setInterval(() => {
			seconds = Math.floor(Date.now() / 1000);
		}, 1000);

		return () => clearInterval(interval);
	});

	const pageCtx = getPageCtx();
	$effect.pre(() => {
		pageCtx.setBreadcrumbs([
			{ name: 'Contests', href: '/contests' },
			{ name: 'Upcoming Contests', href: '/contests/upcoming' },
		]);
	});
</script>

<Head title="Upcoming Contests" description="Upcoming Jacob's Contests for Hypixel Skyblock." />

<div class="flex flex-col items-center justify-center px-4">
	<div class="my-16 flex flex-col items-center gap-4">
		<h1 class="text-center text-4xl">Upcoming Contests - Year {data.year}</h1>
	</div>

	{#if !hasContestData}
		<p class="text-center text-muted-foreground">Upcoming contests have not been reported yet. Try again later.</p>
	{:else}
		<div class="mb-8 flex w-full flex-row justify-center gap-2">
			<CropSelector />
		</div>

		{#if !hasVisibleData}
			<p class="text-center text-muted-foreground">No crops match the current filter.</p>
		{:else}
			<div class="mx-8 flex w-full flex-col items-center justify-center gap-4 md:w-[70%]">
				{#if visibleCurrent}
					<Upcoming
						current={true}
						timestamp={Number(visibleCurrent[0])}
						crops={visibleCurrent[1]}
						currentSeconds={seconds}
					/>
				{/if}

				{#each visibleUpcoming as [timestamp, crops] (timestamp)}
					<Upcoming timestamp={Number(timestamp)} {crops} currentSeconds={seconds} />
				{/each}
			</div>
		{/if}
	{/if}

	<p class="max-w-2xl py-16 text-center text-muted-foreground">
		This data is supplied by users of the mod <a
			class="text-link underline"
			href="https://github.com/hannibal002/SkyHanni/">SkyHanni</a
		>. Open your calendar at the start of the SkyBlock year to share them with the website and other SkyHanni users!
		No data is sent without your consent when using the mod.
	</p>
</div>
