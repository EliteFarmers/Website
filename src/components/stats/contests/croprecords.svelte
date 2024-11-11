<script lang="ts">
	import type { components } from '$lib/api/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import Recordparticipation from './recordparticipation.svelte';
	import { getAnyCropSelected, getSelectedCrops } from '$lib/stores/selectedCrops';

	interface Props {
		crop?: string;
		entries?: components['schemas']['ContestParticipationWithTimestampDto'][];
	}

	let { crop = 'Wheat', entries = [] }: Props = $props();

	let expand = $state(false);

	const anyCropSelected = getAnyCropSelected();
	const selectedCrops = getSelectedCrops();

	let cropUrl = $derived(PROPER_CROP_TO_IMG[crop]);
	let sorted =
		$derived(entries?.sort((a, b) => (b?.collected ?? 0) - (a?.collected ?? 0)).slice(0, expand ? undefined : 10) ?? []);
</script>

{#if $selectedCrops[crop] || !$anyCropSelected}
	<div
		class="max-w-3xl flex-1 basis-1/3 justify-between h-full items-center rounded-md shadow-md bg-primary-foreground"
	>
		<div class="flex flex-row gap-4 justify-center py-4">
			<img src={cropUrl} alt={crop} class="w-10 h-10 pixelated" />
			<h2 class="text-3xl font-semibold text-center">
				{crop ?? 'Not Found'}
			</h2>
		</div>
		<Accordion.Root type="single">
			{#each sorted as participant, i (participant.playerName ?? '' + participant.collected)}
				<Recordparticipation entry={participant} rank={i} />
			{/each}
		</Accordion.Root>
		<div class="flex flex-col md:flex-row gap-4 justify-center my-2 items-center">
			{#if entries.length > 10}
				<Button variant="secondary" on:click={() => (expand = !expand)}
					>{expand ? 'Collapse' : 'Show All'}</Button
				>
			{/if}
		</div>
	</div>
{/if}
