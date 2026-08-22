<script lang="ts">
	import Countdown from '$comp/countdown.svelte';
	import Head from '$comp/seo/head.svelte';
	import CropSelector from '$comp/stats/contests/crop-selector.svelte';
	import type { HarvestFeastRotationDto } from '$lib/api';
	import { selectHarvestFeastRotations } from '$lib/harvest-feast-rotations';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { getHarvestFeast } from '$lib/remote/harvest-feast.remote';
	import { getAnyCropSelected, getSelectedCrops } from '$lib/stores/selectedCrops';
	import { getCropDisplayName, getCropFromName, SkyBlockTime } from 'farming-weight';
	import { onMount } from 'svelte';
	import FeastEntry from './feast-entry.svelte';

	type FeastWaveEntry = {
		start: number;
		end: number;
	};

	type DisplayRotation = {
		start: number;
		end: number;
		crops: string[];
	};

	const harvestFeast = getHarvestFeast();
	const HARVEST_FEAST_WAVE_MONTHS = [7, 8, 9] as const;

	let seconds = $state(Math.floor(Date.now() / 1000));
	let selected = getSelectedCrops();
	let anySelected = getAnyCropSelected();

	function uniqueSortedCrops(crops: string[]): string[] {
		return [...new Set(crops.map(getCropFromName))].map(getCropDisplayName).sort((a, b) => a.localeCompare(b));
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
			start: SkyBlockTime.from(year, month, 1).unixSeconds,
			end: SkyBlockTime.from(year, month + 1, 1).unixSeconds,
		})).filter((rotation) => rotation.end > currentSeconds);
	}

	function getFeastWindow(currentSeconds: number): FeastWaveEntry {
		const rotations = Object.values(feast?.rotations ?? {});
		if (feast?.isGrandFeast && rotations.length > 0) {
			return {
				start: Math.min(...rotations.map((rotation) => Number(rotation.start))),
				end: Math.max(...rotations.map((rotation) => Number(rotation.end))),
			};
		}

		const year = feast?.year ?? getFallbackFeastYear(currentSeconds);
		return {
			start: SkyBlockTime.from(year, HARVEST_FEAST_WAVE_MONTHS[0], 1).unixSeconds,
			end: SkyBlockTime.from(year, HARVEST_FEAST_WAVE_MONTHS.at(-1)! + 1, 1).unixSeconds,
		};
	}

	function toDisplayRotation(rotation: HarvestFeastRotationDto): DisplayRotation {
		return {
			start: Number(rotation.start),
			end: Number(rotation.end),
			crops: uniqueSortedCrops(rotation.crops).filter(cropVisible),
		};
	}

	const feast = $derived(harvestFeast.current);
	const feastWindow = $derived(getFeastWindow(seconds));
	const fallbackWaveStarts = $derived(getFallbackWaveStarts(seconds));
	const rotationSelection = $derived(selectHarvestFeastRotations(feast, seconds));
	const currentRotation = $derived.by(() => {
		if (!rotationSelection.current) return null;
		return toDisplayRotation(rotationSelection.current);
	});
	const upcomingRotations = $derived.by(() =>
		rotationSelection.upcoming.map(toDisplayRotation).filter((rotation) => rotation.crops.length > 0)
	);
	const hasData = $derived((feast?.current ?? null) !== null || Object.keys(feast?.rotations ?? {}).length > 0);
	const hasVisibleData = $derived((currentRotation?.crops.length ?? 0) > 0 || upcomingRotations.length > 0);

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
	<div class="my-16 flex flex-col items-center gap-4">
		<h1 class="text-center text-4xl">Harvest Feast Upcoming Crops</h1>
		{#if feastWindow.end > seconds}
			<div class="flex h-8 flex-row items-center gap-2">
				<Countdown
					start={feastWindow.start * 1000}
					end={feastWindow.end * 1000}
					class="gap-2 text-sm md:text-base"
				>
					{#snippet starting()}
						<p class="mb-0.5 text-sm leading-none whitespace-nowrap text-muted-foreground md:text-base">
							Feast starts in
						</p>
					{/snippet}
					{#snippet ending()}
						<p class="mb-0.5 text-sm leading-none whitespace-nowrap text-muted-foreground md:text-base">
							Feast ends in
						</p>
					{/snippet}
				</Countdown>
			</div>
		{/if}
	</div>

	{#if !hasData}
		<div class="flex max-w-2xl flex-col gap-3 pb-8 text-center">
			<p class="text-muted-foreground">
				Crop data has not been reported yet! The Harvest Feast needs to start for crops to be known!
			</p>
		</div>
		<div class="mx-8 flex w-full flex-col items-center justify-center gap-4 md:w-[70%]">
			{#each fallbackWaveStarts as wave (wave.start)}
				<FeastEntry start={wave.start} end={wave.end} crops={[]} cropsUnknown={true} currentSeconds={seconds} />
			{/each}
		</div>
	{:else}
		<div class="mb-8 flex w-full flex-row justify-center gap-2">
			<CropSelector />
		</div>

		{#if !hasVisibleData}
			<p class="text-center text-muted-foreground">No crops match the current filter.</p>
		{:else}
			<div class="mx-8 flex w-full flex-col items-center justify-center gap-4 md:w-[70%]">
				{#if currentRotation && currentRotation.crops.length > 0}
					<FeastEntry
						current={true}
						start={currentRotation.start}
						end={currentRotation.end}
						crops={currentRotation.crops}
						currentSeconds={seconds}
					/>
				{/if}

				{#each upcomingRotations as rotation (rotation.start)}
					<FeastEntry
						start={rotation.start}
						end={rotation.end}
						crops={rotation.crops}
						currentSeconds={seconds}
					/>
				{/each}
			</div>
		{/if}
	{/if}
</div>
