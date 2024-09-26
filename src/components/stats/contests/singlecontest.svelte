<script lang="ts">
	import type { components } from '$lib/api/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';

	import Participation from '$comp/stats/contests/participation.svelte';
	import { getReadableSkyblockDate } from '$lib/format';

	export let crop = 'Wheat';
	export let participants = -1;
	export let timestamp: number;
	export let entries: components['schemas']['StrippedContestParticipationDto'][] = [];

	let expand = false;

	$: cropUrl = PROPER_CROP_TO_IMG[crop];
	$: sorted =
		entries?.sort((a, b) => (b?.collected ?? 0) - (a?.collected ?? 0)).slice(0, expand ? undefined : 10) ?? [];
</script>

<div class="flex-1 basis-1/4 justify-between h-full items-center rounded-md shadow-md bg-gray-100 dark:bg-zinc-800">
	<div class="flex flex-col items-center justify-start p-4 space-y-2">
		<div class="flex flex-row gap-2">
			<img src={cropUrl} alt={crop} class="w-10 h-10 pixelated" />
			<h2 class="text-3xl font-semibold text-center">
				{crop ?? 'Not Found'}
			</h2>
		</div>
		<h4 class="text-lg">
			{entries?.length ?? 0} / {participants !== -1 ? participants : 'Unknown'} Participants
		</h4>
		<div class="flex flex-col w-full justify-center space-y-2">
			{#each sorted as participant (participant.playerName ?? '' + participant.collected)}
				<Participation entry={participant} />
			{/each}
		</div>
	</div>
	<div class="flex flex-col md:flex-row gap-4 justify-center m-2 items-center">
		<h3 class="text-sm font-light font-mono text-center">
			<span class="bg-gray-200 dark:bg-zinc-900 p-1 px-2 rounded-md whitespace-nowrap">
				{new Date(timestamp * 1000).toLocaleString(undefined, {
					timeStyle: 'short',
					dateStyle: 'short',
					timeZone: 'UTC',
				})} UTC
			</span>
			<span class="bg-gray-200 dark:bg-zinc-900 p-1 px-2 rounded-md whitespace-nowrap">
				{getReadableSkyblockDate(timestamp)}
			</span>
		</h3>
		{#if entries.length > 10}
			<button
				class="whitespace-nowrap bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-900 p-1 px-2 rounded-md"
				on:click={() => (expand = !expand)}>{expand ? 'Collapse' : 'Show All'}</button
			>
		{/if}
	</div>
</div>
