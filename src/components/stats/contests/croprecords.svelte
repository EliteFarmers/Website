<script lang="ts">
	import type { components } from '$lib/api/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { Accordion, AccordionItem } from 'flowbite-svelte';
	import Recordparticipation from './recordparticipation.svelte';
	import { getAnyCropSelected, getSelectedCrops } from '$lib/stores/selectedCrops';

	export let crop = 'Wheat';
	export let entries: components['schemas']['ContestParticipationWithTimestampDto'][] = [];

	let expand = false;
	export let collapsed = true;

	const anyCropSelected = getAnyCropSelected();
	const selectedCrops = getSelectedCrops();

	$: cropUrl = PROPER_CROP_TO_IMG[crop];
	$: sorted =
		entries?.sort((a, b) => (b?.collected ?? 0) - (a?.collected ?? 0)).slice(0, expand ? undefined : 10) ?? [];
</script>

{#if $selectedCrops[crop] || !$anyCropSelected}
	<div
		class="max-w-3xl flex-1 basis-1/3 justify-between h-full items-center rounded-md shadow-md bg-gray-100 dark:bg-zinc-800 pt-4"
	>
		<Accordion flush={true} class="w-full text-black dark:text-white border-none">
			<AccordionItem
				defaultClass="flex flex-row items-center justify-center gap-4 w-full"
				textFlushDefault="text-black dark:text-white py-1 border-none"
				paddingFlush="py-1 px-4"
				borderSharedClass="border-none"
				bind:open={collapsed}
			>
				<div slot="header" class="flex flex-row gap-2">
					<img src={cropUrl} alt={crop} class="w-10 h-10 pixelated" />
					<h2 class="text-3xl font-semibold text-center">
						{crop ?? 'Not Found'}
					</h2>
				</div>
				<div class="flex flex-col w-full justify-center space-y-2">
					<Accordion flush={true} class="w-full text-black dark:text-white">
						{#each sorted as participant, i (participant.playerName ?? '' + participant.collected)}
							<Recordparticipation entry={participant} rank={i} />
						{/each}
					</Accordion>
				</div>
				<div class="flex flex-col md:flex-row gap-4 justify-center my-2 items-center">
					{#if entries.length > 10}
						<button
							class="whitespace-nowrap bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-900 p-1 px-2 rounded-md"
							on:click={() => (expand = !expand)}>{expand ? 'Collapse' : 'Show All'}</button
						>
					{/if}
				</div>
			</AccordionItem>
		</Accordion>
	</div>
{/if}
