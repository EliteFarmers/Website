<script lang="ts">
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { DEFAULT_SELECTED_CROPS, getSelectedCrops } from '$lib/stores/selectedCrops';
	import { ScrollArea } from '$ui/scroll-area';
	const selectedCrops = getSelectedCrops();

	interface Props {
		radio?: boolean;
		href?: string;
		id?: string;
	}

	let { radio = false, href = '', id = '' }: Props = $props();

	let scrollContainer = $state<HTMLElement | null>(null);

	function click(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		},
		crop: string
	) {
		if (radio) {
			selectedCrops.set({ ...DEFAULT_SELECTED_CROPS, [crop]: true });
		} else {
			selectedCrops.update((crops) => ({ ...crops, [crop]: !crops[crop] }));
		}
	}

	let crops = $derived(
		Object.entries(PROPER_CROP_TO_IMG)
			.filter(([crop]) => crop !== 'Seeds')
			.sort(([a], [b]) => a.localeCompare(b))
	);

	selectedCrops.subscribe((crops) => {
		if (!radio || !scrollContainer) return;
		const selected = Object.entries(crops)
			.filter(([, selected]) => selected)
			.map(([crop]) => crop);
		for (const crop of selected) {
			const button = scrollContainer?.querySelector(`button[data-crop="${crop}"]`) as HTMLButtonElement | null;
			if (!button) continue;

			const left =
				button.offsetLeft +
				button.getBoundingClientRect().width / 2 -
				scrollContainer.getBoundingClientRect().width / 2;

			scrollContainer?.scrollTo({ left, behavior: 'smooth' });
		}
	});
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	{href}
	id={id ? id : undefined}
	class="max-w-full scroll-mt-32 overflow-hidden"
>
	<ScrollArea
		bind:viewRef={scrollContainer}
		orientation="horizontal"
		class="overflow-x-auto rounded-md whitespace-nowrap"
	>
		<div class="flex min-w-max items-center justify-center gap-2 py-3">
			{#each crops as [crop, src] (crop)}
				<button
					data-crop={crop}
					class="hover:bg-muted flex aspect-square w-16 flex-row items-center justify-center gap-2 rounded-md p-2 {$selectedCrops[
						crop
					]
						? 'bg-primary/15'
						: ''}"
					onclick={(e) => click(e, crop)}
				>
					<img {src} alt={crop[0]} class="pixelated aspect-square h-12" />
				</button>
			{/each}
		</div>
	</ScrollArea>
</svelte:element>
