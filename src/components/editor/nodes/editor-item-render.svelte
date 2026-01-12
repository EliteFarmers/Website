<script lang="ts">
	import { cn } from '$lib/utils';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	interface Props {
		skyblockId: string;
		class?: string;
	}

	let { skyblockId, class: customClass }: Props = $props();
	let errored = $state(false);
	let loading = $state(true);
</script>

<div class={cn('relative aspect-square', customClass)}>
	{#if loading && !errored}
		<LoaderCircle class="absolute top-1/2 left-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
	{/if}

	<img
		loading="lazy"
		class="h-full w-full rounded-md p-1 {loading || errored ? 'opacity-0' : 'opacity-100'} pixelated aspect-square"
		src="/api/item/{skyblockId}.webp"
		alt="Item"
		onload={() => (loading = false)}
		onerror={() => {
			errored = true;
			loading = false;
		}}
	/>
</div>
