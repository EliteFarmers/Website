<script lang="ts">
	import type { SkyblockItemBlockNode } from '$comp/blocks/blocks';
	import ItemRender from '$comp/items/item-render.svelte';

	interface Props {
		node: SkyblockItemBlockNode;
	}

	let { node }: Props = $props();

	let sizeClass = $derived(node.size === 'sm' ? 'size-6' : node.size === 'md' ? 'size-9' : 'size-12');
</script>

<span class="mx-1 inline-flex align-middle">
	<ItemRender skyblockId={node.skyblockId} pet={node.pet} class="bg-card rounded-md border shadow-sm {sizeClass}" />
</span>
