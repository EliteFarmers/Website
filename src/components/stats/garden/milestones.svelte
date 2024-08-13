<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getCropMilestones } from 'farming-weight';
	import MilestoneBar from './milestone-bar.svelte';

	export let garden: components['schemas']['GardenDto'] | undefined = undefined;
	export let overflow = false;

	$: milestones = Object.entries(getCropMilestones((garden?.crops ?? {}) as Record<string, number>, overflow));
	$: list = milestones?.sort((a, b) => b[1].total - a[1].total) ?? [];
	$: highestSort = true;

	function swap() {
		highestSort = !highestSort;

		list = highestSort
			? milestones?.sort((a, b) => b[1].total - a[1].total)
			: milestones?.sort((a, b) => a[0].localeCompare(b[0]));
	}

	function swapOverflow() {
		overflow = !overflow;
	}
</script>

<div class="flex-1 flex flex-col gap-2 -mt-5 max-w-4xl">
	<div class="flex flex-row gap-2 ml-2 -mt-4">
		<button
			class="rounded-md w-24 py-1 bg-primary-foreground whitespace-nowrap text-sm hover:bg-muted"
			on:click={swap}>{highestSort ? 'Collection ↓' : 'A-Z ↓'}</button
		>
		<button
			class="rounded-md w-20 py-1 bg-primary-foreground whitespace-nowrap text-sm hover:bg-muted"
			on:click={swapOverflow}>{overflow ? 'Overflow' : 'Normal'}</button
		>
	</div>
	<div class="flex flex-col gap-2 w-full">
		{#each list as [crop, leveling] (crop)}
			<MilestoneBar {crop} {leveling} />
		{/each}
	</div>
</div>
