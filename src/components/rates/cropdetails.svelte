<script lang="ts">
	import { PROPER_CROP_TO_API_CROP, PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { ratesData } from '$lib/stores/ratesData';
	import type { Crop } from 'farming-weight';
	import { NumberInput } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	onMount(() => {

	});

	const cropKey = (crop: string) => (PROPER_CROP_TO_API_CROP[crop as keyof typeof PROPER_CROP_TO_API_CROP] ?? crop) as Crop;

	$: crops = Object.entries(PROPER_CROP_TO_IMG).sort(([a], [b]) => a.localeCompare(b));
</script>

<div class="flex flex-col items-center justify-center p-4 gap-2">
	<div class="flex flex-row items-center justify-between gap-2 w-full">
		<div class="w-12"></div>
		<p class="flex-1 whitespace-nowrap">Garden Milestone</p>
		<p class="flex-1 whitespace-nowrap">Crop Upgrade</p>
	</div>
	{#each crops as [crop, src] (crop)}
		{@const key = cropKey(crop)}

		<div class="flex flex-row items-center gap-2">
			<img {src} alt={crop} class="w-12 h-12 pixelated" />
			<NumberInput bind:value={$ratesData.milestones[key]} />
			<NumberInput bind:value={$ratesData.cropUpgrades[key]} />
		</div>
	{/each}
</div>
