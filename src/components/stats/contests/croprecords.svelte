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
	let sorted = $derived(
		entries?.sort((a, b) => (b?.collected ?? 0) - (a?.collected ?? 0)).slice(0, expand ? undefined : 10) ?? []
	);
</script>

{#if $selectedCrops[crop] || !$anyCropSelected}
	<div class="h-full max-w-3xl flex-1 basis-1/3 items-center justify-between rounded-md border-2 bg-card shadow-md">
		<div class="flex flex-row justify-center gap-4 py-4">
			<img src={cropUrl} alt={crop} class="pixelated h-10 w-10" />
			<h2 class="text-center text-3xl font-semibold">
				{crop ?? 'Not Found'}
			</h2>
		</div>
		<Accordion.Root type="single">
			{#each sorted as participant, i (participant.playerName ?? '' + participant.collected)}
				<Recordparticipation entry={participant} rank={i} />
			{/each}
		</Accordion.Root>
		<div class="my-2 flex flex-col items-center justify-center gap-4 md:flex-row">
			{#if entries.length > 10}
				<Button variant="secondary" onclick={() => (expand = !expand)}
					>{expand ? 'Collapse' : 'Show All'}</Button
				>
			{/if}
		</div>
	</div>
{/if}
