<script lang="ts">
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { cn } from '$lib/utils';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	interface Props {
		skyblockId: string;
		pet?: boolean;
		packs?: boolean;
		class?: string;
		count?: number;
	}

	let { skyblockId, pet = false, packs = true, class: customClass, count }: Props = $props();
	let errored = $state(false);
	let loading = $state(true);

	const gbl = getGlobalContext();
</script>

<div class={cn('relative aspect-square', customClass)}>
	{#if loading && !errored}
		<LoaderCircle class="absolute top-1/2 left-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
	{/if}

	<img
		loading="lazy"
		class="h-full w-full rounded-md p-1 {loading || errored ? 'opacity-0' : 'opacity-100'} pixelated aspect-square"
		src="/api/{pet ? 'pet' : 'item'}/{skyblockId}.webp{packs ? gbl.packsParam : ''}"
		alt="Item"
		onload={() => (loading = false)}
		onerror={() => {
			errored = true;
			loading = false;
		}}
	/>

	{#if count !== undefined}
		<div class="bg-opacity-50 absolute right-0 bottom-0 rounded-tl-md bg-black px-1 text-xs text-white">
			x{count}
		</div>
	{/if}
</div>
