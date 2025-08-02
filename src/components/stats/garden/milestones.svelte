<script lang="ts">
	import type { components } from '$lib/api/api';
	import { API_CROP_TO_CROP } from '$lib/constants/crops';
	import { getCropMilestones } from 'farming-weight';
	import MilestoneBar from './milestone-bar.svelte';

	interface Props {
		garden?: components['schemas']['GardenDto'] | undefined;
		ranks?: components['schemas']['LeaderboardRanksResponse']['ranks'] | undefined;
		overflow?: boolean;
	}

	let { garden = undefined, ranks = undefined, overflow = $bindable(false) }: Props = $props();

	let milestones = $derived(
		Object.entries(getCropMilestones((garden?.crops ?? {}) as Record<string, number>, overflow))
	);
	let highestSort = $state(true);
	let list = $derived(sortList());

	function swap() {
		highestSort = !highestSort;
		list = sortList();
	}

	function swapOverflow() {
		overflow = !overflow;
	}

	function sortList() {
		return highestSort
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

	function getCropKey(crop: string) {
		return API_CROP_TO_CROP[crop as keyof typeof API_CROP_TO_CROP];
	}
</script>

<div class="flex max-w-4xl flex-1 flex-col gap-2">
	<div class="flex flex-row items-center justify-between gap-2">
		<div class="flex flex-row items-center gap-2">
			<button class="bg-card hover:bg-muted w-24 rounded-md py-1 text-sm whitespace-nowrap" onclick={swap}
				>{highestSort ? 'Milestone ↓' : 'A-Z ↓'}</button
			>
			<button class="bg-card hover:bg-muted w-20 rounded-md py-1 text-sm whitespace-nowrap" onclick={swapOverflow}
				>{overflow ? 'Overflow' : 'Normal'}</button
			>
		</div>
		<h3 class="mt-1.5 text-lg leading-none font-semibold">Crop Milestones</h3>
	</div>
	<div class="flex w-full flex-col gap-2">
		{#each list as [crop, leveling] (crop)}
			{@const key = getCropKey(crop)}
			<MilestoneBar {crop} {leveling} {key} rank={ranks?.[key + '-milestone']?.rank} />
		{/each}
	</div>
</div>
