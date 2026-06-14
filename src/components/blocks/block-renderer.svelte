<script lang="ts">
	import {
		generateBlockKey,
		mergeComponents,
		type BlockNode,
		type BlockComponents,
		type BlocksRendererProps,
		type ModifierComponents,
	} from './blocks';

	import HoistedCommentCallout from '$comp/comments/hoisted-comment-callout.svelte';
	import type { CommentWithGuideAuthor } from '$lib/guides/types';
	import Link from './elements/a.svelte';
	import AccordionComponent from './elements/accordion.svelte';
	import BlockGridComponent from './elements/block-grid.svelte';
	import Quote from './elements/blockquote.svelte';
	import CalloutComponent from './elements/callout.svelte';
	import CreditsComponent from './elements/credits.svelte';
	import Heading from './elements/heading.svelte';
	import Image from './elements/img.svelte';
	import ItemListComponent from './elements/item-list.svelte';
	import ItemPriceComponent from './elements/item-price.svelte';
	import LitematicComponent from './elements/litematic.svelte';
	import ListItem from './elements/li.svelte';
	import List from './elements/list.svelte';
	import Paragraph from './elements/p.svelte';
	import Code from './elements/pre.svelte';
	import RecipeComponent from './elements/recipe.svelte';
	import SkyblockItem from './elements/skyblock-item.svelte';
	import TableComponent from './elements/table.svelte';
	import TwoColumn from './elements/two-column.svelte';
	import YouTubeComponent from './elements/youtube.svelte';

	import Bold from './inline/bold.svelte';
	import InlineCode from './inline/code.svelte';
	import Italic from './inline/italic.svelte';
	import Strikethrough from './inline/strikethrough.svelte';
	import Underline from './inline/underline.svelte';

	const {
		content,
		blocks = {},
		modifiers = {},
		hoistedComments = {},
		renderTextAsHtml = false,
	}: BlocksRendererProps & { hoistedComments?: Record<string, CommentWithGuideAuthor[]> } = $props();

	const defaultBlocks: BlockComponents = {
		paragraph: Paragraph,
		heading: Heading,
		quote: Quote,
		code: Code,
		image: Image,
		litematic: LitematicComponent,
		list: List,
		'list-item': ListItem,
		'skyblock-item': SkyblockItem,
		'item-price': ItemPriceComponent,
		'two-column': TwoColumn,
		youtube: YouTubeComponent,
		callout: CalloutComponent,
		accordion: AccordionComponent,
		recipe: RecipeComponent,
		'item-list': ItemListComponent,
		credits: CreditsComponent,
		table: TableComponent,
		'block-grid': BlockGridComponent,
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

	function getHoistedComments(node: BlockNode) {
		if (node.type === 'list-item') return [];
		return node.id ? (hoistedComments[node.id] ?? []) : [];
	}

	function getWrapperId(node: BlockNode) {
		return node.type === 'list-item' ? undefined : node.id;
	}
</script>

{#if Array.isArray(content)}
	{#each content as node, index (generateBlockKey(node, index))}
		{#if resolvedBlocks[node.type]}
			{@const Block = resolvedBlocks[node.type] as unknown as import('svelte').Component}
			{@const comments = getHoistedComments(node)}
			<div id={getWrapperId(node)} class="scroll-mt-24">
				<Block {node} {index} modifiers={resolvedModifiers} {hoistedComments} {renderTextAsHtml} />
				{#if comments.length}
					<div class="not-prose">
						{#each comments as comment (comment.id)}
							<HoistedCommentCallout {comment} />
						{/each}
					</div>
				{/if}
			</div>
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
