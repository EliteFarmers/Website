<script lang="ts">
	import type { components } from '$lib/api/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';

	import Participation from '$comp/stats/contests/participation.svelte';
	import { getReadableSkyblockDate } from '$lib/format';
	import { Button } from '$ui/button';
	import { ScrollArea } from '$ui/scroll-area';

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

<div class="h-full items-center justify-between rounded-md border-2 bg-primary-foreground shadow-md">
	<div class="flex flex-col items-center justify-start space-y-2 px-2 py-4 pb-2">
		<div class="flex flex-row gap-2">
			<img src={cropUrl} alt={crop} class="pixelated h-10 w-10" />
			<h2 class="text-center text-3xl font-semibold">
				{crop ?? 'Not Found'}
			</h2>
		</div>
		<span>
			{entries?.length ?? 0} / {participants !== -1 ? participants : 'Unknown'} Participants
		</span>
		<ScrollArea class="h-[29.62rem] w-full rounded-md border">
			<div class="flex w-[26rem] flex-col justify-center space-y-2">
				{#each sorted as participant}
					<Participation entry={participant} />
				{/each}
			</div>
		</ScrollArea>
	</div>
	<div class="flex flex-col items-center justify-center gap-2 pb-2 md:flex-row">
		<div class="flex flex-col rounded-md bg-card text-center font-mono text-sm font-light leading-tight">
			<span class="whitespace-nowrap rounded-md p-1 px-2">
				{new Date(timestamp * 1000).toLocaleString(undefined, {
					timeStyle: 'short',
					dateStyle: 'short',
					timeZone: 'UTC',
				})} UTC
			</span>
			<span class="whitespace-nowrap rounded-md p-1 px-2">
				{getReadableSkyblockDate(timestamp)}
			</span>
		</div>
		{#if entries.length > 10}
			<Button
				class="w-32 whitespace-nowrap rounded-md"
				size="sm"
				variant="secondary"
				onclick={() => (expand = !expand)}>{expand ? 'Show Less' : 'Load More'}</Button
			>
		{/if}
	</div>
</div>
