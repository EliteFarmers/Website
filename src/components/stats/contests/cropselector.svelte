<script lang="ts">
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { DEFAULT_SELECTED_CROPS, getSelectedCrops } from '$lib/stores/selectedCrops';
	const selectedCrops = getSelectedCrops();

	export let radio = false;

	function click(crop: string) {
		if (radio) {
			selectedCrops.set({ ...DEFAULT_SELECTED_CROPS, [crop]: true });
		} else {
			selectedCrops.update((crops) => ({ ...crops, [crop]: !crops[crop] }));
		}
	}

	$: crops = Object.entries(PROPER_CROP_TO_IMG).sort(([a], [b]) => a.localeCompare(b));
</script>

<div class="flex flex-wrap items-center justify-center p-4 gap-2">
	{#each crops as [crop, src] (crop)}
		<button
			class="flex flex-row items-center justify-center gap-2 p-2 rounded-md hover:bg-muted {$selectedCrops[crop]
				? 'bg-primary-foreground'
				: 'bg-primary-foreground/50'}"
			on:click={() => click(crop)}
		>
			<img {src} alt={crop[0]} class="w-12 h-12 pixelated" />
		</button>
	{/each}
</div>
