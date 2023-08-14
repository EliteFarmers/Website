<script lang="ts">
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { selectedCrops } from '$lib/stores/selectedCrops';

	$: crops = Object.entries(PROPER_CROP_TO_IMG).sort(([a], [b]) => a.localeCompare(b));
</script>

<div class="flex flex-wrap items-center justify-center p-4 gap-2">
	{#each crops as [crop, src] (crop)}
		<button
			class="flex flex-row items-center justify-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-900 {$selectedCrops[
				crop
			]
				? 'bg-gray-300 dark:bg-zinc-700'
				: 'bg-gray-100 dark:bg-zinc-800'}"
			on:click={() => ($selectedCrops[crop] = !$selectedCrops[crop])}
		>
			<img {src} alt={crop[0]} class="w-12 h-12 pixelated" />
		</button>
	{/each}
</div>
