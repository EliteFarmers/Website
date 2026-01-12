<script lang="ts">
	import {
		generateBlockKey,
		mergeComponents,
		type BlockComponents,
		type BlocksRendererProps,
		type ModifierComponents,
	} from './blocks';

	import Link from './elements/a.svelte';
	import Quote from './elements/blockquote.svelte';
	import CalloutComponent from './elements/callout.svelte';
	import Heading from './elements/heading.svelte';
	import Image from './elements/img.svelte';
	import ItemPriceComponent from './elements/item-price.svelte';
	import ListItem from './elements/li.svelte';
	import List from './elements/list.svelte';
	import Paragraph from './elements/p.svelte';
	import Code from './elements/pre.svelte';
	import SkyblockItem from './elements/skyblock-item.svelte';
	import TwoColumn from './elements/two-column.svelte';
	import YouTubeComponent from './elements/youtube.svelte';

	import Bold from './inline/bold.svelte';
	import InlineCode from './inline/code.svelte';
	import Italic from './inline/italic.svelte';
	import Strikethrough from './inline/strikethrough.svelte';
	import Underline from './inline/underline.svelte';

	const { content, blocks = {}, modifiers = {} }: BlocksRendererProps = $props();

	const defaultBlocks: BlockComponents = {
		paragraph: Paragraph,
		heading: Heading,
		quote: Quote,
		code: Code,
		image: Image,
		list: List,
		'list-item': ListItem,
		'skyblock-item': SkyblockItem,
		'item-price': ItemPriceComponent,
		'two-column': TwoColumn,
		youtube: YouTubeComponent,
		callout: CalloutComponent,
	};

	const defaultModifiers: ModifierComponents = {
		bold: Bold,
		italic: Italic,
		underline: Underline,
		strikethrough: Strikethrough,
		code: InlineCode,
		link: Link,
	};

	let resolvedBlocks = $derived(mergeComponents(defaultBlocks, blocks));
	let resolvedModifiers = $derived(mergeComponents(defaultModifiers, modifiers));
</script>

{#if Array.isArray(content)}
	{#each content as node, index (generateBlockKey(node, index))}
		{#if resolvedBlocks[node.type]}
			{@const Block = resolvedBlocks[node.type] as unknown as import('svelte').Component}
			<Block {node} {index} modifiers={resolvedModifiers} />
		{:else}
			<div class="blocks-renderer-unknown">
				Unknown block type: <code>{node.type}</code>
			</div>
		{/if}
	{/each}
{:else}
	<div class="blocks-renderer-empty">No content to render.</div>
{/if}

<style>
	.blocks-renderer-unknown {
		color: #b00;
		background: #fee;
		border: 1px solid #fcc;
		font-family: monospace;
		padding: 0.5em;
		margin: 0.25em 0;
		border-radius: 0.25rem;
	}

	.blocks-renderer-empty {
		color: #888;
		font-style: italic;
		margin: 0.25em 0;
	}
</style>
