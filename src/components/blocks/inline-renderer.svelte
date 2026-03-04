<script lang="ts">
	import { isItemPriceNode, isLinkNode, isSkyblockItemNode, isTextNode, type InlineRendererProps } from './blocks.js';
	import ItemPrice from './elements/item-price.svelte';
	import SkyblockItem from './elements/skyblock-item.svelte';
	import InlineRenderer from './inline-renderer.svelte';
	import TextRenderer from './text-renderer.svelte';

	const { nodes, modifiers }: InlineRendererProps = $props();
</script>

{#each nodes as node, i (`${node.type}-${i}`)}
	{#if isTextNode(node)}
		<TextRenderer {node} {modifiers} />
	{:else if isLinkNode(node)}
		{@const Link = modifiers.link}
		<Link url={node.url}>
			<InlineRenderer nodes={node.children} {modifiers} />
		</Link>
	{:else if isSkyblockItemNode(node)}
		<SkyblockItem {node} />
	{:else if isItemPriceNode(node)}
		<ItemPrice {node} />
	{/if}
{/each}
