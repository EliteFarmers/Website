<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getCropMilestones } from 'farming-weight';
	import MilestoneBar from './milestone-bar.svelte';
	import { API_CROP_TO_CROP } from '$lib/constants/crops';

	interface Props {
		garden?: components['schemas']['GardenDto'] | undefined;
		ranks?: components['schemas']['LeaderboardPositionsDto']['profile'] | undefined;
		overflow?: boolean;
	}

	let { garden = undefined, ranks = undefined, overflow = $bindable(false) }: Props = $props();

	let milestones = $derived(Object.entries(getCropMilestones((garden?.crops ?? {}) as Record<string, number>, overflow)));
	let list = $state<typeof milestones>([]);
	let highestSort = $state(true);
	
	$effect.pre(() => {
		list = milestones?.sort((a, b) => b[1].total - a[1].total) ?? [];
	});

	function swap() {
		highestSort = !highestSort;

		list = highestSort
			? milestones?.sort((a, b) => {
				if (b[1].level === a[1].level) {
					if (b[1].ratio === a[1].ratio) {
						return b[1].total - a[1].total;
					}
					return b[1].ratio - a[1].ratio;
				}
				return b[1].level - a[1].level;
			})
			: milestones?.sort((a, b) => a[0].localeCompare(b[0]));
	}

	function swapOverflow() {
		overflow = !overflow;
	}

	function getCropKey(crop: string) {
		return API_CROP_TO_CROP[crop as keyof typeof API_CROP_TO_CROP];
	}
</script>

<div class="flex-1 flex flex-col gap-2 max-w-4xl">
	<div class="flex flex-row gap-2 items-center justify-between">
		<div class="flex flex-row items-center gap-2">
			<button
				class="rounded-md w-24 py-1 bg-primary-foreground whitespace-nowrap text-sm hover:bg-muted"
				onclick={swap}>{highestSort ? 'Milestone ↓' : 'A-Z ↓'}</button
			>
			<button
				class="rounded-md w-20 py-1 bg-primary-foreground whitespace-nowrap text-sm hover:bg-muted"
				onclick={swapOverflow}>{overflow ? 'Overflow' : 'Normal'}</button
			>
		</div>
		<h3 class="text-lg font-semibold leading-none mt-1.5">Crop Milestones</h3>
	</div>
	<div class="flex flex-col gap-2 w-full">
		{#each list as [crop, leveling] (crop)}
			{@const key = getCropKey(crop)}
			<MilestoneBar {crop} {leveling} {key} rank={ranks?.[key + '-milestone']} />
		{/each}
	</div>
</div>
