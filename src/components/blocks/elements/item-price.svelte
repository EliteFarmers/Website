<script lang="ts">
	import type { ItemPriceBlockNode } from '$comp/blocks/blocks';
	import { getItemValue } from '$lib/remote/items.remote';
	import Coins from '@lucide/svelte/icons/coins';

	interface Props {
		node: ItemPriceBlockNode;
	}

	let { node }: Props = $props();

	const priceQuery = $derived(getItemValue(node.skyblockId));
	let displayPrice = $derived(priceQuery.ready ? (priceQuery.current?.lowest ?? 0) * (node.multiplier ?? 1) : 0);
</script>

<span
	class="inline-flex items-center gap-1 rounded-sm bg-card px-1 py-0 font-medium text-completed outline-1 outline-completed/70"
>
	<Coins class="my-0 inline size-3 py-0" />
	{#if priceQuery.loading}
		<span class="animate-pulse">...</span>
	{:else if priceQuery.error}
		<span class="text-destructive">Error</span>
	{:else}
		<span class="font-mono text-primary">{displayPrice.toLocaleString()}</span>
	{/if}
</span>
