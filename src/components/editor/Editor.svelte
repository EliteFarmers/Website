<script lang="ts">
	import type { RootNode } from '$comp/blocks/blocks';
	import {
		onEditAccordion,
		onEditBlockGrid,
		onEditItemList,
		onEditItemPrice,
		onEditRecipe,
		onEditSkyblockItem,
		type EditAccordionEvent,
		type EditBlockGridEvent,
		type EditItemListEvent,
		type EditItemPriceEvent,
		type EditRecipeEvent,
		type EditSkyblockItemEvent,
	} from '$lib/editor/editor-events';
	import { Accordion } from '$lib/editor/extensions/accordion';
	import { BlockGrid } from '$lib/editor/extensions/block-grid';
	import { Callout } from '$lib/editor/extensions/callout';
	import { ItemList } from '$lib/editor/extensions/item-list';
	import { ItemPrice } from '$lib/editor/extensions/item-price';
	import { Recipe } from '$lib/editor/extensions/recipe';
	import { SkyblockItem } from '$lib/editor/extensions/skyblock-item';
	import { ColumnLeft, ColumnRight, TwoColumn } from '$lib/editor/extensions/two-column';
	import { YouTube } from '$lib/editor/extensions/youtube';
	import { strapiToTiptap, tiptapToStrapi } from '$lib/editor/transformer';
	import { Button } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import Bold from '@lucide/svelte/icons/bold';
	import Code from '@lucide/svelte/icons/code';
	import Coins from '@lucide/svelte/icons/coins';
	import Columns from '@lucide/svelte/icons/columns-2';
	import Grid3x3 from '@lucide/svelte/icons/grid-3x3';
	import Heading1 from '@lucide/svelte/icons/heading-1';
	import Heading2 from '@lucide/svelte/icons/heading-2';
	import Heading3 from '@lucide/svelte/icons/heading-3';
	import ImageIcon from '@lucide/svelte/icons/image';
	import Italic from '@lucide/svelte/icons/italic';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import LinkIcon from '@lucide/svelte/icons/link';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Package from '@lucide/svelte/icons/package';
	import Plus from '@lucide/svelte/icons/plus';
	import Quote from '@lucide/svelte/icons/quote';
	import Redo from '@lucide/svelte/icons/redo';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import SquareChevronDown from '@lucide/svelte/icons/square-chevron-down';
	import Strikethrough from '@lucide/svelte/icons/strikethrough';
	import TableIcon from '@lucide/svelte/icons/table-2';
	import Undo from '@lucide/svelte/icons/undo';
	import Unlink from '@lucide/svelte/icons/unlink';
	import YoutubeIcon from '@lucide/svelte/icons/youtube';
	import { Editor, type Content } from '@tiptap/core';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';
	import { Table } from '@tiptap/extension-table';
	import { TableCell } from '@tiptap/extension-table-cell';
	import { TableHeader } from '@tiptap/extension-table-header';
	import { TableRow } from '@tiptap/extension-table-row';
	import StarterKit from '@tiptap/starter-kit';
	import { onMount } from 'svelte';
	import InsertAccordionDialog from './dialogs/insert-accordion-dialog.svelte';
	import InsertBlockGridDialog from './dialogs/insert-block-grid-dialog.svelte';
	import InsertCalloutDialog from './dialogs/insert-callout-dialog.svelte';
	import InsertItemDialog from './dialogs/insert-item-dialog.svelte';
	import InsertItemListDialog from './dialogs/insert-item-list-dialog.svelte';
	import InsertPriceDialog from './dialogs/insert-price-dialog.svelte';
	import InsertRecipeDialog from './dialogs/insert-recipe-dialog.svelte';
	import InsertYouTubeDialog from './dialogs/insert-youtube-dialog.svelte';

	let {
		content,
		onChange,
		class: className,
	}: { content: string | RootNode; onChange?: (content: RootNode) => void; class?: string } = $props();

	let element: HTMLElement;
	let editor: Editor | undefined = $state();
	let showInsertItemDialog = $state(false);
	let showInsertPriceDialog = $state(false);
	let showYouTubeDialog = $state(false);
	let showCalloutDialog = $state(false);
	let showRecipeDialog = $state(false);
	let showItemListDialog = $state(false);
	let showBlockGridDialog = $state(false);
	let showAccordionDialog = $state(false);
	let editSkyblockItem = $state<EditSkyblockItemEvent | null>(null);
	let editItemPrice = $state<EditItemPriceEvent | null>(null);
	let editRecipe = $state<EditRecipeEvent | null>(null);
	let editItemList = $state<EditItemListEvent | null>(null);
	let editBlockGrid = $state<EditBlockGridEvent | null>(null);
	let editAccordion = $state<EditAccordionEvent | null>(null);

	onMount(() => {
		// Subscribe to edit events from node views
		const unsubscribeSkyblock = onEditSkyblockItem((data) => {
			editSkyblockItem = data;
			showInsertItemDialog = true;
		});
		const unsubscribePrice = onEditItemPrice((data) => {
			editItemPrice = data;
			showInsertPriceDialog = true;
		});
		const unsubscribeRecipe = onEditRecipe((data) => {
			editRecipe = data;
			showRecipeDialog = true;
		});
		const unsubscribeItemList = onEditItemList((data) => {
			editItemList = data;
			showItemListDialog = true;
		});
		const unsubscribeBlockGrid = onEditBlockGrid((data) => {
			editBlockGrid = data;
			showBlockGridDialog = true;
		});
		const unsubscribeAccordion = onEditAccordion((data) => {
			editAccordion = data;
			showAccordionDialog = true;
		});

		let initialContent: string | unknown = '';
		if (typeof content === 'string') {
			try {
				// Try to detect if it's our JSON format (starts with [ maybe?)
				if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
					const parsed = JSON.parse(content);
					if (Array.isArray(parsed)) {
						initialContent = strapiToTiptap(parsed as RootNode);
					} else {
						initialContent = parsed;
					}
				} else {
					initialContent = content;
				}
			} catch {
				initialContent = content;
			}
		} else {
			initialContent = strapiToTiptap(content);
		}

		editor = new Editor({
			element: element,
			extensions: [
				StarterKit,
				Link.configure({
					openOnClick: false,
				}),
				Image,
				SkyblockItem,
				ItemPrice,
				TwoColumn,
				ColumnLeft,
				ColumnRight,
				YouTube,
				Callout,
				Accordion,
				Recipe,
				ItemList,
				Table.configure({ resizable: true }),
				TableRow,
				TableCell,
				TableHeader,
				TableHeader,
				BlockGrid,
			],
			content: initialContent as Content,
			onTransaction: () => {
				// Force re-render of toolbar state
				editor = editor;
			},
			onUpdate: ({ editor }) => {
				const json = editor.getJSON();
				const strapiBlocks = tiptapToStrapi(json);
				if (onChange) {
					onChange(strapiBlocks);
				}
			},
			editorProps: {
				attributes: {
					class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
				},
			},
		});

		return () => {
			unsubscribeSkyblock();
			unsubscribePrice();
			unsubscribeRecipe();
			unsubscribeItemList();
			unsubscribeBlockGrid();
			unsubscribeAccordion();
			editor?.destroy();
		};
	});

	function setLink() {
		if (!editor) return;
		const previousUrl = editor.getAttributes('link').href;
		const url = window.prompt('URL', previousUrl);

		// cancelled
		if (url === null) {
			return;
		}

		// empty
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}

		// update
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	}

	function addImage() {
		if (!editor) return;
		const url = window.prompt('Image URL');

		if (url) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	}
</script>

<div
	class={`bg-background flex flex-col rounded-md border ${className || ''}`}
	onkeydown={(e) => e.stopPropagation()}
	tabindex={0}
	role="textbox"
>
	{#if editor}
		<div class="bg-muted/50 sticky top-16 z-10 flex flex-wrap gap-1 border-b p-2 backdrop-blur-sm">
			<Button
				variant="ghost"
				size="icon"
				class={editor.isActive('bold') ? 'bg-accent' : ''}
				onclick={() => editor?.chain().focus().toggleBold().run()}
				title="Bold"
			>
				<Bold class="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class={editor.isActive('italic') ? 'bg-accent' : ''}
				onclick={() => editor?.chain().focus().toggleItalic().run()}
				title="Italic"
			>
				<Italic class="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class={editor.isActive('strike') ? 'bg-accent' : ''}
				onclick={() => editor?.chain().focus().toggleStrike().run()}
				title="Strikethrough"
			>
				<Strikethrough class="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class={editor.isActive('code') ? 'bg-accent' : ''}
				onclick={() => editor?.chain().focus().toggleCode().run()}
				title="Code"
			>
				<Code class="h-4 w-4" />
			</Button>

			<div class="bg-border mx-1 w-px"></div>

			<Button
				variant="ghost"
				size="icon"
				class={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
				title="Heading 1"
			>
				<Heading1 class="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
				title="Heading 2"
			>
				<Heading2 class="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
				title="Heading 3"
			>
				<Heading3 class="h-4 w-4" />
			</Button>

			<div class="bg-border mx-1 w-px"></div>

			<Button
				variant="ghost"
				size="icon"
				class={editor.isActive('bulletList') ? 'bg-accent' : ''}
				onclick={() => editor?.chain().focus().toggleBulletList().run()}
				title="Bullet List"
			>
				<List class="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class={editor.isActive('orderedList') ? 'bg-accent' : ''}
				onclick={() => editor?.chain().focus().toggleOrderedList().run()}
				title="Ordered List"
			>
				<ListOrdered class="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class={editor.isActive('blockquote') ? 'bg-accent' : ''}
				onclick={() => editor?.chain().focus().toggleBlockquote().run()}
				title="Quote"
			>
				<Quote class="h-4 w-4" />
			</Button>

			<div class="bg-border mx-1 w-px"></div>

			<Button
				variant="ghost"
				size="icon"
				class={editor.isActive('link') ? 'bg-accent' : ''}
				onclick={setLink}
				title="Link"
			>
				<LinkIcon class="h-4 w-4" />
			</Button>
			{#if editor.isActive('link')}
				<Button
					variant="ghost"
					size="icon"
					onclick={() => editor?.chain().focus().unsetLink().run()}
					title="Unlink"
				>
					<Unlink class="h-4 w-4" />
				</Button>
			{/if}
			<Button variant="ghost" size="icon" onclick={addImage} title="Image">
				<ImageIcon class="h-4 w-4" />
			</Button>

			<!-- Custom Elements - Desktop (hidden on mobile) -->
			<div class="hidden md:contents">
				<Button
					variant="ghost"
					size="icon"
					class={editor.isActive('skyblockItem') ? 'bg-accent' : ''}
					onclick={() => {
						showInsertItemDialog = true;
					}}
					title="Insert Skyblock Item"
				>
					<Package class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class={editor.isActive('itemPrice') ? 'bg-accent' : ''}
					onclick={() => {
						showInsertPriceDialog = true;
					}}
					title="Insert Item Price"
				>
					<Coins class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => editor?.chain().focus().setTwoColumn().run()}
					title="Insert Two Column (Plain)"
				>
					<Columns class="stroke-muted-foreground h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => editor?.chain().focus().setTwoColumn({ variant: 'bordered' }).run()}
					title="Insert Two Column (Bordered)"
					class="relative"
				>
					<Columns class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => (showYouTubeDialog = true)}
					title="Insert YouTube Video"
				>
					<YoutubeIcon class="h-4 w-4" />
				</Button>
				<Button variant="ghost" size="icon" onclick={() => (showCalloutDialog = true)} title="Insert Callout">
					<AlertCircle class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => editor?.chain().focus().setAccordion({ title: 'Click to expand' }).run()}
					title="Insert Accordion"
				>
					<SquareChevronDown class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => editor?.chain().focus().setRecipe().run()}
					title="Insert Recipe"
				>
					<Grid3x3 class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => editor?.chain().focus().setItemList().run()}
					title="Insert Item List"
				>
					<ShoppingCart class="h-4 w-4" />
				</Button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="ghost" size="icon" title="Table Options">
							<TableIcon class="h-4 w-4" />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Item
							onclick={() =>
								editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
						>
							Insert Table
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={() => editor?.chain().focus().addColumnBefore().run()}>
							Add Column Before
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => editor?.chain().focus().addColumnAfter().run()}>
							Add Column After
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => editor?.chain().focus().deleteColumn().run()}>
							Delete Column
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={() => editor?.chain().focus().addRowBefore().run()}>
							Add Row Before
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => editor?.chain().focus().addRowAfter().run()}>
							Add Row After
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => editor?.chain().focus().deleteRow().run()}>
							Delete Row
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={() => editor?.chain().focus().mergeCells().run()}>
							Merge Cells
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => editor?.chain().focus().splitCell().run()}>
							Split Cell
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={() => editor?.chain().focus().toggleHeaderRow().run()}>
							Toggle Header Row
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => editor?.chain().focus().toggleHeaderColumn().run()}>
							Toggle Header Column
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							onclick={() => editor?.chain().focus().deleteTable().run()}
							class="text-destructive"
						>
							Delete Table
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => editor?.chain().focus().setBlockGrid().run()}
					title="Insert Block Grid"
				>
					<LayoutGrid class="h-4 w-4" />
				</Button>
			</div>

			<!-- Custom Elements - Mobile Dropdown (hidden on desktop) -->
			<div class="md:hidden">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="ghost" size="icon" title="Insert Element">
							<Plus class="h-4 w-4" />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start">
						<DropdownMenu.Item onclick={() => (showInsertItemDialog = true)}>
							<Package class="mr-2 h-4 w-4" />
							Skyblock Item
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => (showInsertPriceDialog = true)}>
							<Coins class="mr-2 h-4 w-4" />
							Item Price
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={() => editor?.chain().focus().setTwoColumn().run()}>
							<Columns class="mr-2 h-4 w-4" />
							Two Column (Plain)
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => editor?.chain().focus().setTwoColumn({ variant: 'bordered' }).run()}
						>
							<Columns class="mr-2 h-4 w-4" />
							Two Column (Bordered)
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={() => (showYouTubeDialog = true)}>
							<YoutubeIcon class="mr-2 h-4 w-4" />
							YouTube Video
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => (showCalloutDialog = true)}>
							<AlertCircle class="mr-2 h-4 w-4" />
							Callout
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => editor?.chain().focus().setAccordion({ title: 'Click to expand' }).run()}
						>
							<SquareChevronDown class="mr-2 h-4 w-4" />
							Accordion
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={() => editor?.chain().focus().setRecipe().run()}>
							<Grid3x3 class="mr-2 h-4 w-4" />
							Recipe
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => editor?.chain().focus().setItemList().run()}>
							<ShoppingCart class="mr-2 h-4 w-4" />
							Item List
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() =>
								editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
						>
							<TableIcon class="mr-2 h-4 w-4" />
							Table
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => editor?.chain().focus().setBlockGrid().run()}>
							<LayoutGrid class="mr-2 h-4 w-4" />
							Block Grid
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<div class="bg-border mx-1 w-px"></div>

			<Button
				variant="ghost"
				size="icon"
				onclick={() => editor?.chain().focus().undo().run()}
				disabled={!editor.can().undo()}
				title="Undo"
			>
				<Undo class="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onclick={() => editor?.chain().focus().redo().run()}
				disabled={!editor.can().redo()}
				title="Redo"
			>
				<Redo class="h-4 w-4" />
			</Button>
		</div>
	{/if}

	<div bind:this={element} class="editor-content w-full flex-1"></div>
</div>

<InsertItemDialog
	open={showInsertItemDialog}
	onOpenChange={(v) => {
		showInsertItemDialog = v;
		if (!v) editSkyblockItem = null;
	}}
	{editor}
	editNode={editSkyblockItem}
/>

<InsertPriceDialog
	open={showInsertPriceDialog}
	onOpenChange={(v) => {
		showInsertPriceDialog = v;
		if (!v) editItemPrice = null;
	}}
	{editor}
	editNode={editItemPrice}
/>

<InsertYouTubeDialog open={showYouTubeDialog} onOpenChange={(v) => (showYouTubeDialog = v)} {editor} />

<InsertCalloutDialog open={showCalloutDialog} onOpenChange={(v) => (showCalloutDialog = v)} {editor} />

<InsertRecipeDialog
	open={showRecipeDialog}
	onOpenChange={(v) => {
		showRecipeDialog = v;
		if (!v) editRecipe = null;
	}}
	{editor}
	editNode={editRecipe}
/>

<InsertItemListDialog
	open={showItemListDialog}
	onOpenChange={(v) => {
		showItemListDialog = v;
		if (!v) editItemList = null;
	}}
	{editor}
	editNode={editItemList}
/>

<InsertBlockGridDialog
	open={showBlockGridDialog}
	onOpenChange={(v) => {
		showBlockGridDialog = v;
		if (!v) editBlockGrid = null;
	}}
	{editor}
	editNode={editBlockGrid}
/>

<InsertAccordionDialog
	open={showAccordionDialog}
	onOpenChange={(v) => {
		showAccordionDialog = v;
		if (!v) editAccordion = null;
	}}
	{editor}
	editNode={editAccordion}
/>

<style>
	.editor-content :global(.ProseMirror) {
		min-height: 300px;
		padding: 1rem;
		outline: none;
	}

	.editor-content :global(.ProseMirror h1) {
		font-size: 2em;
		font-weight: 700;
		margin-top: 0.67em;
		margin-bottom: 0.67em;
	}

	.editor-content :global(.ProseMirror h2) {
		font-size: 1.5em;
		font-weight: 600;
		margin-top: 0.83em;
		margin-bottom: 0.83em;
	}

	.editor-content :global(.ProseMirror h3) {
		font-size: 1.17em;
		font-weight: 600;
		margin-top: 1em;
		margin-bottom: 1em;
	}

	.editor-content :global(.ProseMirror p) {
		margin-top: 1em;
		margin-bottom: 1em;
	}

	.editor-content :global(.ProseMirror ul),
	.editor-content :global(.ProseMirror ol) {
		padding-left: 1.5em;
		margin-top: 1em;
		margin-bottom: 1em;
	}

	.editor-content :global(.ProseMirror ul) {
		list-style-type: disc;
	}

	.editor-content :global(.ProseMirror ol) {
		list-style-type: decimal;
	}

	.editor-content :global(.ProseMirror blockquote) {
		border-left: 3px solid var(--border);
		padding-left: 1em;
		margin-left: 0;
		font-style: italic;
	}

	.editor-content :global(.ProseMirror code) {
		background-color: var(--muted);
		padding: 0.2em 0.4em;
		border-radius: 0.25rem;
		font-family: monospace;
	}

	.editor-content :global(.ProseMirror pre) {
		background-color: var(--muted);
		padding: 1em;
		border-radius: 0.5rem;
		overflow-x: auto;
	}

	.editor-content :global(.ProseMirror a) {
		color: var(--primary);
		text-decoration: underline;
	}

	.editor-content :global(.ProseMirror img) {
		max-width: 100%;
		height: auto;
	}

	/* Tables */
	.editor-content :global(table) {
		border-collapse: collapse;
		table-layout: fixed;
		width: 100%;
		margin: 0;
		overflow: hidden;
	}

	.editor-content :global(td),
	.editor-content :global(th) {
		min-width: 1em;
		border: 1px solid var(--border);
		padding: 3px 5px;
		vertical-align: top;
		box-sizing: border-box;
		position: relative;
	}

	.editor-content :global(th) {
		font-weight: bold;
		text-align: left;
		background-color: var(--muted);
	}

	.editor-content :global(.selectedCell:after) {
		z-index: 2;
		position: absolute;
		content: '';
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background: color-mix(in srgb, var(--primary) 20%, transparent);
		pointer-events: none;
	}

	/* Two-Column Grid */
	.editor-content :global([data-type='two-column']) {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin: 1rem 0;
	}

	.editor-content :global([data-type='column-left']),
	.editor-content :global([data-type='column-right']) {
		border: 1px dashed var(--border);
		border-radius: 0.5rem;
		padding: 0.75rem;
		min-height: 4rem;
		background-color: color-mix(in srgb, var(--muted) 30%, transparent);
	}

	.editor-content :global([data-type='two-column'][data-variant='bordered'] [data-type='column-left']),
	.editor-content :global([data-type='two-column'][data-variant='bordered'] [data-type='column-right']) {
		border: 1px solid var(--border);
		background-color: var(--card);
	}
</style>
