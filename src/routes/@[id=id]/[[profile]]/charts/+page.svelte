<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import CropGraph from '$comp/charts/crop-graph.svelte';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import type { ActionData, PageData } from './$types';
	import { DatePicker } from '$ui/date-picker';
	import { Button } from '$ui/button';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import { getSelectedCrops, getAnyCropSelected } from '$lib/stores/selectedCrops';
	import JumpLink from '$comp/jump-link.svelte';
	import Head from '$comp/head.svelte';

	export let data: PageData;
	export let form: ActionData;

	const anySelected = getAnyCropSelected();
	const selectedCrops = getSelectedCrops();
	const minDate = new CalendarDate(2023, 7, 1);

	$: crops = form?.graph ?? data.crops;
	$: entries = Object.entries(crops);
	$: selected = (crop: string) => $selectedCrops[crop] || !$anySelected;

	$: tz = getLocalTimeZone();

	let initEnd = today(tz);
	let initStart = initEnd.subtract({ days: 7 });
	let disabled = false;

	$: value = initStart;
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
		<input type="hidden" value={7} name="days" />

		<div class="flex flex-col gap-2 items-center">
			<div class="flex flex-row gap-2 items-center">
				<DatePicker bind:value maxValue={initEnd} minValue={minDate} />
				<Button type="submit" variant="default" bind:disabled>Update</Button>
			</div>
		</div>
	</form>

	<div class="flex flex-wrap justify-center w-full">
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
		{#each entries as [crop, data] (crop)}
			{@const name = getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)}
			{#if selected(name)}
				<div class="basis-[46rem] flex flex-col gap-1 p-2">
					<div class="flex flex-row gap-1 ml-4">
						<img src={PROPER_CROP_TO_IMG[name]} alt={crop} class="pixelated aspect-square h-full" />
						<h3 class="text-2xl">{name}</h3>
						<JumpLink id={crop} />
					</div>
					<CropGraph {data} {crop} />
				</div>
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
