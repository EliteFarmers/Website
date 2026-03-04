<script lang="ts">
	import Participation from '$comp/stats/contests/participation.svelte';
	import type { StrippedContestParticipationDto } from '$lib/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getReadableSkyblockDate } from '$lib/format';
	import { Button } from '$ui/button';
	import { ScrollArea } from '$ui/scroll-area';
	import { tick } from 'svelte';

	interface Props {
		crop?: string;
		participants?: number;
		timestamp: number;
		entries?: StrippedContestParticipationDto[];
	}

	let { crop = 'Wheat', participants = -1, timestamp, entries = [] }: Props = $props();

	let expand = $state(false);

	let cropUrl = $derived(PROPER_CROP_TO_IMG[crop]);
	let sorted = $derived(
		entries?.sort((a, b) => (b?.collected ?? 0) - (a?.collected ?? 0)).slice(0, expand ? undefined : 10) ?? []
	);

	let area = $state<HTMLElement | null>(null);

	function toggle() {
		expand = !expand;
		if (expand) {
			tick().then(() => {
				area?.scrollTo({ top: 473.92, behavior: 'smooth' });
			});
		}
	}
</script>

<div class="bg-card h-full w-full max-w-108 items-center justify-between rounded-md border-2 shadow-md">
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
		<ScrollArea bind:viewRef={area} class="h-[29.62rem] w-full rounded-md border" type="always">
			<div class="flex w-full flex-col justify-center space-y-2 sm:w-104">
				{#each sorted as participant, i (i)}
					<Participation entry={participant} />
				{/each}
			</div>
		</ScrollArea>
	</div>
	<div class="flex flex-col items-center justify-center gap-2 pb-2 md:flex-row">
		<div class="bg-card flex flex-col rounded-md text-center font-mono text-sm leading-tight font-light">
			<span class="rounded-md p-1 px-2 whitespace-nowrap">
				{new Date(timestamp * 1000).toLocaleString(undefined, {
					timeStyle: 'short',
					dateStyle: 'short',
					timeZone: 'UTC',
				})} UTC
			</span>
			<span class="rounded-md p-1 px-2 whitespace-nowrap">
				{getReadableSkyblockDate(timestamp)}
			</span>
		</div>
		{#if entries.length > 10}
			<Button class="w-32 rounded-md whitespace-nowrap" size="sm" variant="secondary" onclick={toggle}
				>{expand ? 'Show Less' : 'Load More'}</Button
			>
		{/if}
	</div>
</div>
