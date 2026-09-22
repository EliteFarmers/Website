<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { getCropMilestones, type LevelingStats } from 'farming-weight';
	import MilestoneBar from './milestone-bar.svelte';

	interface Props {
		overflow?: boolean;
	}

	let { overflow = $bindable(false) }: Props = $props();

	const ctx = getStatsContext();

	const garden = $derived(ctx.garden);
	let highestSort = $state(true);

	let milestones = $derived(
		Object.entries(getCropMilestones((garden?.crops ?? {}) as Record<string, number>, overflow)).sort(
			highestSort ? sorter : (a, b) => a[0].localeCompare(b[0])
		)
	);

	function swap() {
		highestSort = !highestSort;
	}

	function swapOverflow() {
		overflow = !overflow;
	}

	function sorter(a: [string, LevelingStats], b: [string, LevelingStats]) {
		if (b[1].level === a[1].level) {
			if (b[1].ratio === a[1].ratio) {
				return b[1].total - a[1].total;
			}
			return b[1].ratio - a[1].ratio;
		}
		return b[1].level - a[1].level;
	}
</script>

<div class="flex max-w-4xl flex-1 flex-col gap-2">
	<div class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-background p-2 text-foreground">
		<div class="flex flex-row items-center gap-2">
			<button
				class="w-24 rounded-md bg-card py-1 text-sm whitespace-nowrap text-card-foreground hover:bg-muted"
				onclick={swap}>{highestSort ? 'Milestone ↓' : 'A-Z ↓'}</button
			>
			<button
				class="w-20 rounded-md bg-card py-1 text-sm whitespace-nowrap text-card-foreground hover:bg-muted"
				onclick={swapOverflow}>{overflow ? 'Overflow' : 'Normal'}</button
			>
		</div>
		<h3 class="mt-1.5 text-lg leading-none font-semibold">Crop Milestones</h3>
	</div>
	<div class="flex w-full flex-col gap-2">
		{#each milestones as [crop, leveling] (crop)}
			<MilestoneBar {crop} {leveling} />
		{/each}
	</div>
</div>
