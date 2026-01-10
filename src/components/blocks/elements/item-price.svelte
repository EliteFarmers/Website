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

<span class="text-destructive/30 inline-flex items-center gap-1 font-medium">
	<Coins class="size-4" />
	{#if priceQuery.loading}
		<span class="animate-pulse">...</span>
	{:else if priceQuery.error}
		<span class="text-destructive">Error</span>
	{:else}
		<span class="font-mono">{displayPrice.toLocaleString()}</span>
	{/if}
</span>
