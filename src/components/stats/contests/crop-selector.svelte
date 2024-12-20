<script lang="ts">
	import { ScrollArea } from '$ui/scroll-area';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { DEFAULT_SELECTED_CROPS, getSelectedCrops } from '$lib/stores/selectedCrops';
	const selectedCrops = getSelectedCrops();

	interface Props {
		radio?: boolean;
		href?: string;
		id?: string;
	}

	let { radio = false, href = '', id = '' }: Props = $props();

	function click(crop: string) {
		if (radio) {
			selectedCrops.set({ ...DEFAULT_SELECTED_CROPS, [crop]: true });
		} else {
			selectedCrops.update((crops) => ({ ...crops, [crop]: !crops[crop] }));
		}
	}

	let crops = $derived(Object.entries(PROPER_CROP_TO_IMG).sort(([a], [b]) => a.localeCompare(b)));
</script>

<svelte:element this={href ? 'a' : 'div'} {href} id={id ? id : undefined} class="max-w-full scroll-mt-32">
	<ScrollArea orientation="horizontal" class="w-3xl overflow-hidden whitespace-nowrap rounded-md">
		<div class="flex flex-row items-center justify-center gap-2 p-3">
			{#each crops as [crop, src] (crop)}
				<button
					class="flex aspect-square w-16 flex-row items-center justify-center gap-2 rounded-md p-2 hover:bg-muted {$selectedCrops[
						crop
					]
						? 'bg-primary/15'
						: ''}"
					onclick={() => click(crop)}
				>
					<img {src} alt={crop[0]} class="pixelated aspect-square h-12" />
				</button>
			{/each}
		</div>
	</ScrollArea>
</svelte:element>
