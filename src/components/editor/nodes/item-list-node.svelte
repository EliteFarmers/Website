<script lang="ts">
	import type { ItemListItem } from '$comp/blocks/blocks';
	import { dispatchEditItemList } from '$lib/editor/editor-events';
	import type { SvelteNodeViewComponentProps } from '$lib/editor/svelte-node-view-renderer';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import EditorItemRender from './editor-item-render.svelte';

	let { node, selected, getPos }: SvelteNodeViewComponentProps = $props();

	let items = $derived((node.attrs.items as ItemListItem[]) || []);

	function handleClick() {
		const pos = getPos();
		if (pos !== undefined) {
			dispatchEditItemList({ items, pos });
		}
	}
</script>

<button
	type="button"
	onclick={handleClick}
	class={`bg-card my-2 flex w-full cursor-pointer flex-col gap-2 rounded-lg border p-4 text-left shadow-sm ${selected ? 'ring-primary ring-2' : ''}`}
>
	<div class="text-muted-foreground flex items-center gap-2 text-sm font-medium">
		<ShoppingCart class="size-4" />
		Item List ({items.length} items)
	</div>
	{#if items.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each items.slice(0, 6) as item (item.skyblockId)}
				<div class="flex items-center gap-1">
					<EditorItemRender skyblockId={item.skyblockId} class="size-6" />
					<span class="text-xs">{item.quantity}x</span>
				</div>
			{/each}
			{#if items.length > 6}
				<span class="text-muted-foreground text-xs">+{items.length - 6} more</span>
			{/if}
		</div>
	{:else}
		<span class="text-muted-foreground text-sm">Click to add items</span>
	{/if}
</button>
