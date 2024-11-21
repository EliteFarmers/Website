<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import CropGraph from '$comp/charts/crop-graph.svelte';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import type { ActionData, PageData } from './$types';
	import { DatePicker } from '$ui/date-picker';
	import { SelectSimple } from '$ui/select';
	import { Switch } from '$ui/switch';
	import { Button } from '$ui/button';
	import * as Popover from '$ui/popover';
	import { Crop, CROP_WEIGHT, getCropDisplayName, getCropFromName } from 'farming-weight';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import { getSelectedCrops, getAnyCropSelected } from '$lib/stores/selectedCrops';
	import JumpLink from '$comp/jump-link.svelte';
	import Head from '$comp/head.svelte';
	import { differenceInDays } from 'date-fns';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data = $bindable(), form }: Props = $props();

	const anySelected = getAnyCropSelected();
	const selectedCrops = getSelectedCrops();
	const minDate = new CalendarDate(2023, 7, 1);

	function mapCrops(crops: typeof data.crops) {
		return Object.entries(crops)
			.filter(([crop]) => crop !== 'seeds')
			.map(([crop, data]) => {
				const c = getCropFromName(crop) ?? Crop.Wheat;
				const name = getCropDisplayName(c);

				if (data.length < 2) {
					increases[crop] = 0;
				} else {
					const first = data[0];
					const last = data.at(-1) ?? first;
					increases[crop] = (last.value - first.value) * CROP_WEIGHT[c];
					highestIncrease = Math.max(highestIncrease, increases[crop]);
					pestIncreased = last.pests > 0;
				}

				return { name, data, crop };
			});
	}

	function getStart(days: number) {
		const dayDiff = differenceInDays(today(tz).toDate(tz), value.toDate(tz));
		if (!value || dayDiff > 30) return;

		value = initEnd.subtract({ days });
	}

	function back() {
		value = value.subtract({ days });
	}

	function forward() {
		if (value >= initEnd) return;
		value = value.add({ days });
		if (value > initEnd) value = initEnd;
	}

	let crops = $derived(form?.graph ?? data.crops);
	let increases = $derived({} as Record<string, number>);
	let highestIncrease = $state(0);

	let pestIncreased = $state(false);

	let entries = $derived(mapCrops(crops));
	let pestToggle = $state(false);

	let showPests = $derived(pestToggle && pestIncreased);
	let selected = $derived((crop: string) => $selectedCrops[crop] || !$anySelected);
	let selectedCount = $derived(Object.values($selectedCrops).filter(Boolean).length);
	let fewSelected = $derived(selectedCount <= 3 && $anySelected);
	const tz = getLocalTimeZone();
	let days = $state(7);

	const initEnd = today(tz);
	let disabled = $state(false);
	let initStart = initEnd.subtract({ days: 7 });

	let value = $state(initStart);

	$effect(() => {
		getStart(days);
	});

	let backEnabled = $derived(value <= minDate);
	let fowardEnabled = $derived(value >= initEnd);
	let startTime = $derived(Math.floor(value.toDate(tz).getTime() / 1000));
</script>

<Head title="{data.account.name} | Charts" description="See crop collection charts for Hypixel Skyblock!" />

<div class="flex w-full flex-col items-center justify-center gap-4">
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
		<input type="hidden" value={startTime} name="start" />
		<input type="hidden" bind:value={days} name="days" />

		<div class="flex flex-col items-center gap-2">
			<div class="flex flex-col items-center gap-2">
				<div class="flex flex-row items-center gap-2">
					<Button onclick={back} variant="outline" disabled={backEnabled}>
						<ArrowLeft />
					</Button>
					<DatePicker bind:value maxValue={initEnd} minValue={minDate} class="w-48" />
					<Button onclick={forward} variant="outline" disabled={fowardEnabled}>
						<ArrowRight />
					</Button>
				</div>
				<div class="flex flex-row items-center gap-2">
					<div class="flex flex-col items-center gap-1 text-center">
						<p class="text-sm leading-none">Show Pests</p>
						{#if !pestIncreased}
							<Popover.Mobile>
								{#snippet trigger()}
									<Switch bind:checked={pestToggle} disabled={true} />
								{/snippet}
								<div class="p-2">
									<p class="text-sm">Pest data not available for this time period.</p>
								</div>
							</Popover.Mobile>
						{:else}
							<Switch bind:checked={pestToggle} />
						{/if}
					</div>
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
					<Button type="submit" variant="default" {disabled}>Update</Button>
				</div>
			</div>
		</div>
	</form>

	<div class="flex {fewSelected ? 'flex-col' : 'flex-wrap'} w-full max-w-7xl justify-center">
		{#if entries.length === 0}
			<div class="mb-16 flex max-w-lg flex-col items-center justify-center space-y-2 p-4 text-center">
				<h2 class="text-center text-3xl font-semibold">No Data Found</h2>
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
					<div class="flex basis-[40rem] flex-col gap-1 p-2">
						<div class="ml-4 flex flex-row gap-1">
							<img src={PROPER_CROP_TO_IMG[name]} alt={crop} class="pixelated aspect-square h-full w-8" />
							<h3 class="text-2xl">{name}</h3>
							<JumpLink id={crop} />
						</div>
						<CropGraph {data} {crop} ratio={increases[crop] / highestIncrease} pests={showPests} />
					</div>
				{:else}
					<div class="max-w-7xl flex-1 flex-col gap-1 p-2">
						<div class="ml-4 flex flex-row items-center gap-1">
							<img src={PROPER_CROP_TO_IMG[name]} alt={crop} class="pixelated aspect-square h-full w-8" />
							<h3 class="text-2xl">{name}</h3>
							<JumpLink id={crop} />
						</div>
						<CropGraph {data} {crop} ratio={1} pests={showPests} />
					</div>
				{/if}
			{/if}
		{/each}
	</div>

	<div class="mx-4 mt-16 flex max-w-lg flex-col justify-center gap-1">
		<h5 class="text-center text-lg font-semibold">How is this data obtained?</h5>
		<p class="text-left">
			Your collections are only stored when they're requested. This may result in missing data, especially if
			collections API has been turned off for the player. Data points are limited to 4 per 24 hours intentionally
			to minimize privacy concerns. This data originally comes from Hypixel's public API.
		</p>
	</div>
</div>
