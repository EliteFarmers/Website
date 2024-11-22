<script lang="ts">
	import type { components } from '$lib/api/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';

	import Participation from '$comp/stats/contests/participation.svelte';
	import { getReadableSkyblockDate } from '$lib/format';

	interface Props {
		crop?: string;
		participants?: number;
		timestamp: number;
		entries?: components['schemas']['StrippedContestParticipationDto'][];
	}

	let { crop = 'Wheat', participants = -1, timestamp, entries = [] }: Props = $props();

	let expand = $state(false);

	let cropUrl = $derived(PROPER_CROP_TO_IMG[crop]);
	let sorted = $derived(
		entries?.sort((a, b) => (b?.collected ?? 0) - (a?.collected ?? 0)).slice(0, expand ? undefined : 10) ?? []
	);
</script>

<div class="h-full flex-1 basis-1/4 items-center justify-between rounded-md bg-gray-100 shadow-md dark:bg-zinc-800">
	<div class="flex flex-col items-center justify-start space-y-2 p-4">
		<div class="flex flex-row gap-2">
			<img src={cropUrl} alt={crop} class="pixelated h-10 w-10" />
			<h2 class="text-center text-3xl font-semibold">
				{crop ?? 'Not Found'}
			</h2>
		</div>
		<h4 class="text-lg">
			{entries?.length ?? 0} / {participants !== -1 ? participants : 'Unknown'} Participants
		</h4>
		<div class="flex w-full flex-col justify-center space-y-2">
			{#each sorted as participant (participant.playerName ?? '' + participant.collected)}
				<Participation entry={participant} />
			{/each}
		</div>
	</div>
	<div class="m-2 flex flex-col items-center justify-center gap-4 md:flex-row">
		<h3 class="text-center font-mono text-sm font-light">
			<span class="whitespace-nowrap rounded-md bg-gray-200 p-1 px-2 dark:bg-zinc-900">
				{new Date(timestamp * 1000).toLocaleString(undefined, {
					timeStyle: 'short',
					dateStyle: 'short',
					timeZone: 'UTC',
				})} UTC
			</span>
			<span class="whitespace-nowrap rounded-md bg-gray-200 p-1 px-2 dark:bg-zinc-900">
				{getReadableSkyblockDate(timestamp)}
			</span>
		</h3>
		{#if entries.length > 10}
			<button
				class="whitespace-nowrap rounded-md bg-gray-200 p-1 px-2 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-900"
				onclick={() => (expand = !expand)}>{expand ? 'Collapse' : 'Show All'}</button
			>
		{/if}
	</div>
</div>
