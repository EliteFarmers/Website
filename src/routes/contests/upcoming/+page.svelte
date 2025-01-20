<script lang="ts">
	import Head from '$comp/head.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Upcoming from './upcoming.svelte';
	import { getAnyCropSelected, getSelectedCrops } from '$lib/stores/selectedCrops';
	import CropSelector from '$comp/stats/contests/crop-selector.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let contests = $derived(Object.entries((data.contests ?? {}) as Record<number, string[]>) as [string, string[]][]);
	let seconds = $state(Math.floor(Date.now() / 1000));

	let current = $derived(contests.find(([time]) => +time < seconds && seconds <= +time + 1200));
	let upcoming = $derived(
		contests.filter(([time]) => +time > seconds).map(([time, contest]) => [time, contest.sort()]) as [
			string,
			string[],
		][]
	);

	let selected = getSelectedCrops();
	let anySelected = getAnyCropSelected();

	onMount(() => {
		const interval = setInterval(() => {
			seconds = Math.floor(Date.now() / 1000);
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<Head title="Upcoming Contests" description="Upcoming Jacob's Contests for Hypixel Skyblock." />

<div class="flex flex-col items-center justify-center">
	<h1 class="my-16 text-4xl">Upcoming Contests - Year {data.year}</h1>

	{#if upcoming.length === 0}
		<p>No upcoming contests have been provided yet! Try again later!</p>
	{:else}
		<div class="mb-8 flex w-full flex-row justify-center gap-2">
			<CropSelector />
		</div>
		<div class="mx-8 flex w-full flex-col items-center justify-center gap-4 md:w-[70%]">
			{#if current && (!$anySelected || current[1].some((c) => $selected[c]))}
				<Upcoming current={true} timestamp={+current[0]} crops={current[1]} currentSeconds={seconds} />
			{/if}
			{#each upcoming as [timestamp, contest] (timestamp)}
				{#if !$anySelected || contest.some((c) => $selected[c])}
					<Upcoming timestamp={+timestamp} crops={contest} currentSeconds={seconds} />
				{/if}
			{/each}
		</div>
	{/if}

	<p class="max-w-2xl py-16 text-center">
		This data is supplied by users of the mod <a class="underline" href="https://github.com/hannibal002/SkyHanni/"
			>SkyHanni</a
		>. Open your calender at the start of the skyblock year to share them with the website and other SkyHanni users!
		No data is sent without your consent when using the mod.
	</p>
</div>
