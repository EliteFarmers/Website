<script lang="ts">
	import { cn } from '$lib/utils';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	interface Props {
		packId: string;
		class?: string;
	}

	let { packId, class: customClass }: Props = $props();
	let errored = $state(false);
	let loading = $state(true);
	let ref = $state<HTMLImageElement | null>(null);

	function onLoad() {
		loading = false;

		const container = ref?.parentElement;
		if (ref && container) {
			if (ref.naturalWidth < container.clientWidth && ref.naturalHeight < container.clientHeight) {
				ref.style.imageRendering = 'pixelated';
			}
		}
	}
</script>

<div class={cn('relative aspect-square', customClass)}>
	{#if loading && !errored}
		<LoaderCircle class="absolute top-1/2 left-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
	{/if}

	<img
		bind:this={ref}
		loading="lazy"
		class="h-full w-full rounded-md p-1 {loading || errored ? 'opacity-0' : 'opacity-100'} aspect-square"
		src={packId == 'vanilla' ? '/api/item/GRASS.webp?packs=vanilla' : `/api/packicon/${packId}.png`}
		alt="Item"
		onload={onLoad}
		onerror={() => {
			errored = true;
			loading = false;
		}}
	/>
</div>
