<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import CropGraph from '$comp/charts/crop-graph.svelte';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import type { ActionData, PageData } from './$types';
	import { DatePicker } from '$ui/date-picker';
	import { SelectSimple } from '$ui/select';
	import { Button } from '$ui/button';
	import { Crop, CROP_WEIGHT, getCropDisplayName, getCropFromName } from 'farming-weight';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import { getSelectedCrops, getAnyCropSelected } from '$lib/stores/selectedCrops';
	import JumpLink from '$comp/jump-link.svelte';
	import Head from '$comp/head.svelte';
	import { differenceInDays } from 'date-fns';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';

	export let data: PageData;
	export let form: ActionData;

	const anySelected = getAnyCropSelected();
	const selectedCrops = getSelectedCrops();
	const minDate = new CalendarDate(2023, 7, 1);

	$: crops = form?.graph ?? data.crops;
	$: increases = {} as Record<string, number>;
	$: highestIncrease = 0;
	$: entries = mapCrops(crops);

	function mapCrops(crops: Record<string, { date: string; value: number }[]>) {
		return Object.entries(crops)
			.filter(([crop]) => crop !== 'seeds')
			.map(([crop, data]) => {
				const c = getCropFromName(crop) ?? Crop.Wheat;
				const name = getCropDisplayName(c);

				if (data.length < 2) {
					increases[crop] = 0;
				} else {
					const first = data[0].value;
					const last = data.at(-1)?.value ?? first;
					increases[crop] = (last - first) * CROP_WEIGHT[c];
					highestIncrease = Math.max(highestIncrease, increases[crop]);
				}

				return { name, data, crop };
			});
	}

	$: selected = (crop: string) => $selectedCrops[crop] || !$anySelected;
	$: selectedCount = Object.values($selectedCrops).filter(Boolean).length;
	$: fewSelected = selectedCount <= 3 && $anySelected;

	$: tz = getLocalTimeZone();

	let initEnd = today(tz);
	let disabled = false;
	let initStart = initEnd.subtract({ days: 7 });

	$: days = 7;
	$: value = initStart;

	$: getStart(days);
	function getStart(days: number) {
		const dayDiff = differenceInDays(today(tz).toDate(tz), value.toDate(tz));
		if (!value || dayDiff > 30) return;

		value = initEnd.subtract({ days });
	}

	$: backEnabled = value <= minDate;
	function back() {
		value = value.subtract({ days });
	}

	$: fowardEnabled = value >= initEnd;
	function forward() {
		if (value >= initEnd) return;
		value = value.add({ days });
		if (value > initEnd) value = initEnd;
	}

	$: startTime = Math.floor(value.toDate(tz).getTime() / 1000);
</script>

<Head title="{data.account.name} | Charts" description="See crop collection charts for Hypixel Skyblock!" />

<div class="flex flex-col justify-center items-center w-full gap-4">
	<Cropselector />
	<form
		method="post"
		action="?/collectiongraph"
		use:enhance={() => {
			disabled = true;

			return async ({ result }) => {
				await applyAction(result);
				disabled = false;
			};
		}}
	>
		<input type="hidden" bind:value={data.account.id} name="uuid" />
		<input type="hidden" bind:value={data.profile.profileId} name="profile" />
		<input type="hidden" bind:value={startTime} name="start" />
		<input type="hidden" bind:value={days} name="days" />

		<div class="flex flex-col gap-2 items-center">
			<div class="flex flex-col gap-2 items-center">
				<div class="flex flex-row gap-2 items-center">
					<Button on:click={back} variant="outline" disabled={backEnabled}>
						<ArrowLeft />
					</Button>
					<DatePicker bind:value maxValue={initEnd} minValue={minDate} class="w-48" />
					<Button on:click={forward} variant="outline" disabled={fowardEnabled}>
						<ArrowRight />
					</Button>
				</div>
				<div class="flex flex-row gap-2 items-center">
					<SelectSimple
						options={[
							{ label: '3 Days', value: 3 },
							{ label: '1 Week', value: 7 },
							{ label: '2 Weeks', value: 14 },
							{ label: '3 Weeks', value: 21 },
							{ label: '1 Month', value: 30 },
						]}
						bind:value={days}
						class="w-32"
					/>
					<Button type="submit" variant="default" bind:disabled>Update</Button>
				</div>
			</div>
		</div>
	</form>

	<div class="flex {fewSelected ? 'flex-col' : 'flex-wrap'} justify-center max-w-7xl w-full">
		{#if entries.length === 0}
			<div class="flex flex-col items-center justify-center p-4 space-y-2 mb-16 max-w-lg text-center">
				<h2 class="text-3xl font-semibold text-center">No Data Found</h2>
				<h4>Try a different time!</h4>
				<p>
					There may be nothing to find if a player has kept their collections API disabled or is new to the
					website.
				</p>
			</div>
		{/if}
		{#each entries as { name, crop, data } (crop)}
			{#if selected(name)}
				{#if !fewSelected}
					<div class="basis-[40rem] flex flex-col gap-1 p-2">
						<div class="flex flex-row gap-1 ml-4">
							<img src={PROPER_CROP_TO_IMG[name]} alt={crop} class="pixelated aspect-square h-full w-8" />
							<h3 class="text-2xl">{name}</h3>
							<JumpLink id={crop} />
						</div>
						<CropGraph {data} {crop} ratio={increases[crop] / highestIncrease} />
					</div>
				{:else}
					<div class="flex-1 flex-col gap-1 p-2 max-w-7xl">
						<div class="flex flex-row gap-1 ml-4 items-center">
							<img src={PROPER_CROP_TO_IMG[name]} alt={crop} class="pixelated aspect-square h-full w-8" />
							<h3 class="text-2xl">{name}</h3>
							<JumpLink id={crop} />
						</div>
						<CropGraph {data} {crop} ratio={1} />
					</div>
				{/if}
			{/if}
		{/each}
	</div>

	<div class="flex flex-col justify-center max-w-lg gap-1 mx-4 mt-16">
		<h5 class="text-lg font-semibold text-center">How is this data obtained?</h5>
		<p class="text-left">
			Your collections are only stored when they're requested. This may result in missing data, especially if
			collections API has been turned off for the player. Data points are limited to 4 per 24 hours intentionally
			to minimize privacy concerns. This data originally comes from Hypixel's public API.
		</p>
	</div>
</div>
