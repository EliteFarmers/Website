<script lang="ts">
	import Head from '$comp/seo/head.svelte';
	import CropSelector from '$comp/stats/contests/crop-selector.svelte';
	import { PROPER_CROP_NAME, PROPER_CROP_TO_API_CROP } from '$lib/constants/crops';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { getHarvestFeast } from '$lib/remote/harvest-feast.remote';
	import { DEFAULT_SELECTED_CROPS, getAnyCropSelected, getSelectedCrops } from '$lib/stores/selectedCrops';
	import { SkyBlockTime } from 'farming-weight';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import FeastEntry from './feast-entry.svelte';

	type FeastCropEntry = {
		crop: string;
		timestamp: number | null;
	};

	type FeastWaveEntry = {
		timestamp: number;
	};

	const harvestFeast = getHarvestFeast();
	const displayCrops = Object.keys(DEFAULT_SELECTED_CROPS);
	const cropAliases = new SvelteMap<string, string>();
	const HARVEST_FEAST_WAVE_MONTHS = [7, 8, 9] as const;

	for (const crop of displayCrops) {
		const apiCrop = PROPER_CROP_TO_API_CROP[crop];
		const compact = crop.replaceAll(' ', '');

		for (const key of [crop, crop.toLowerCase(), compact, compact.toLowerCase(), apiCrop, apiCrop?.toLowerCase()]) {
			if (key) cropAliases.set(key, crop);
		}
	}

	cropAliases.set('INK_SACK', 'Cocoa Beans');
	cropAliases.set('ink_sack', 'Cocoa Beans');

	let seconds = $state(Math.floor(Date.now() / 1000));
	let selected = getSelectedCrops();
	let anySelected = getAnyCropSelected();

	function normalizeCrop(crop: string): string {
		return (
			cropAliases.get(crop) ??
			cropAliases.get(crop.replaceAll(/[_:\s-]/g, '').toLowerCase()) ??
			PROPER_CROP_NAME[crop] ??
			crop
		);
	}

	function uniqueSortedCrops(crops: string[]): string[] {
		return [...new Set(crops.map(normalizeCrop).filter((crop) => crop in DEFAULT_SELECTED_CROPS))].sort((a, b) =>
			a.localeCompare(b)
		);
	}

	function cropVisible(crop: string): boolean {
		return !$anySelected || $selected[crop] === true;
	}

	function getFallbackFeastYear(currentSeconds: number): number {
		const now = new SkyBlockTime(currentSeconds * 1000);
		return now.month > 9 ? now.year + 1 : now.year;
	}

	function getFallbackWaveStarts(currentSeconds: number): FeastWaveEntry[] {
		const year = getFallbackFeastYear(currentSeconds);
		return HARVEST_FEAST_WAVE_MONTHS.map((month) => ({
			timestamp: SkyBlockTime.from(year, month, 1).unixSeconds,
		}));
	}

	const feast = $derived(harvestFeast.current);
	const fallbackWaveStarts = $derived(getFallbackWaveStarts(seconds));
	const nextEntries = $derived.by<FeastCropEntry[]>(() => {
		const next = feast?.next ?? {};
		return Object.entries(next)
			.map(([crop, timestamp]) => ({
				crop: normalizeCrop(crop),
				timestamp: timestamp === null || timestamp === undefined ? null : Number(timestamp),
			}))
			.filter((entry) => entry.crop in DEFAULT_SELECTED_CROPS);
	});
	const currentCrops = $derived(uniqueSortedCrops(feast?.current ?? []).filter(cropVisible));
	const upcomingGroups = $derived.by(() => {
		const groups = new SvelteMap<number, string[]>();

		for (const entry of nextEntries) {
			if (entry.timestamp === null || entry.timestamp <= seconds || !cropVisible(entry.crop)) continue;

			const crops = groups.get(entry.timestamp) ?? [];
			crops.push(entry.crop);
			groups.set(entry.timestamp, crops);
		}

		return [...groups.entries()]
			.map(([timestamp, crops]) => ({ timestamp, crops: uniqueSortedCrops(crops) }))
			.sort((a, b) => a.timestamp - b.timestamp);
	});
	const unknownCrops = $derived(
		uniqueSortedCrops(nextEntries.filter((entry) => entry.timestamp === null).map((entry) => entry.crop)).filter(
			cropVisible
		)
	);
	const hasData = $derived((feast?.current?.length ?? 0) > 0 || Object.keys(feast?.next ?? {}).length > 0);
	const hasVisibleData = $derived(currentCrops.length > 0 || upcomingGroups.length > 0 || unknownCrops.length > 0);

	onMount(() => {
		const interval = setInterval(() => {
			seconds = Math.floor(Date.now() / 1000);
		}, 1000);

		return () => clearInterval(interval);
	});

	const pageCtx = getPageCtx();
	$effect.pre(() => {
		pageCtx.setBreadcrumbs([
			{ name: 'Harvest Feast' },
			{ name: 'Upcoming Crops', href: '/harvest-feast/upcoming' },
		]);
	});
</script>

<Head title="Harvest Feast Upcoming Crops" description="Upcoming Harvest Feast crop seasons for Hypixel SkyBlock." />

<div class="flex flex-col items-center justify-center px-4">
	<h1 class="my-16 text-center text-4xl">Harvest Feast Upcoming Crops</h1>

	{#if !hasData}
		<div class="flex max-w-2xl flex-col gap-3 pb-8 text-center">
			<p class="text-muted-foreground">
				Crop data has not been reported yet! The Harvest Feast needs to start for crops to be known!
			</p>
		</div>
		<div class="mx-8 flex w-full flex-col items-center justify-center gap-4 md:w-[70%]">
			{#each fallbackWaveStarts as wave (wave.timestamp)}
				<FeastEntry timestamp={wave.timestamp} crops={[]} cropsUnknown={true} currentSeconds={seconds} />
			{/each}
		</div>
	{:else}
		<div class="mb-8 flex w-full flex-row justify-center gap-2">
			<CropSelector />
		</div>

		{#if !hasVisibleData}
			<p class="text-muted-foreground text-center">No crops match the current filter.</p>
		{:else}
			<div class="mx-8 flex w-full flex-col items-center justify-center gap-4 md:w-[70%]">
				{#if currentCrops.length > 0}
					<FeastEntry current={true} crops={currentCrops} currentSeconds={seconds} />
				{/if}

				{#each upcomingGroups as group (group.timestamp)}
					<FeastEntry timestamp={group.timestamp} crops={group.crops} currentSeconds={seconds} />
				{/each}

				{#if unknownCrops.length > 0}
					<FeastEntry unknown={true} crops={unknownCrops} currentSeconds={seconds} />
				{/if}
			</div>
		{/if}
	{/if}
</div>
