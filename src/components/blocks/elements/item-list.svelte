<script lang="ts">
	import type { ItemListBlockNode } from '$comp/blocks/blocks';
	import ItemRender from '$comp/items/item-render.svelte';
	import { getItemValue } from '$lib/remote/items.remote';

	interface Props {
		node: ItemListBlockNode;
	}

	let { node }: Props = $props();

	function formatPrice(price: number): string {
		if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(2)}B`;
		if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(2)}M`;
		if (price >= 1_000) return `${(price / 1_000).toFixed(2)}K`;
		return price.toLocaleString();
	}
</script>

<div class="bg-card my-4 rounded-lg border p-4 shadow-sm">
	<div class="flex flex-col gap-2">
		{#each node.items as item (item.skyblockId)}
			{@const priceQuery = getItemValue(item.skyblockId)}
			{@const price = priceQuery.ready ? (priceQuery.current?.lowest ?? 0) : 0}
			<div class="flex items-center gap-3">
				<ItemRender skyblockId={item.skyblockId} class="size-8" />
				<span class="font-medium">{item.quantity}x</span>
				<span class="text-muted-foreground flex-1 text-sm">{priceQuery.current?.name ?? item.skyblockId}</span>
				{#if priceQuery.loading}
					<span class="animate-pulse font-mono text-sm">...</span>
				{:else}
					<span class="font-mono text-sm">{formatPrice(price * item.quantity)}</span>
				{/if}
			</div>
		{/each}
	</div>
</div>
