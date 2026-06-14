<script lang="ts">
	import {
		isItemPriceNode,
		isLinkNode,
		isSkyblockItemNode,
		isTextNode,
		isWikiLinkNode,
		type InlineRendererProps,
	} from './blocks.js';
	import ItemPrice from './elements/item-price.svelte';
	import SkyblockItem from './elements/skyblock-item.svelte';
	import WikiLink from './elements/wiki-link.svelte';
	import InlineRenderer from './inline-renderer.svelte';
	import TextRenderer from './text-renderer.svelte';

	const { nodes, modifiers, renderTextAsHtml = false }: InlineRendererProps = $props();
</script>

{#each nodes as node, i (`${node.type}-${i}`)}
	{#if isTextNode(node)}
		<TextRenderer {node} {modifiers} {renderTextAsHtml} />
	{:else if isLinkNode(node)}
		{@const Link = modifiers.link}
		<Link url={node.url}>
			<InlineRenderer nodes={node.children} {modifiers} {renderTextAsHtml} />
		</Link>
	{:else if isSkyblockItemNode(node)}
		<SkyblockItem {node} />
	{:else if isItemPriceNode(node)}
		<ItemPrice {node} />
	{:else if isWikiLinkNode(node)}
		<WikiLink {node} />
	{/if}
{/each}
