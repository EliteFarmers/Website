import type { Component, Snippet } from 'svelte';

export function isTextNode(n: InlineNode): n is TextNode {
	return n?.type === 'text';
}

export function isLinkNode(n: InlineNode): n is LinkNode {
	return n?.type === 'link';
}

export function isSkyblockItemNode(n: InlineNode): n is SkyblockItemBlockNode {
	return n?.type === 'skyblock-item';
}

export function isItemPriceNode(n: InlineNode): n is ItemPriceBlockNode {
	return n?.type === 'item-price';
}

export function getActiveModifiers(n: TextNode): Array<'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'> {
	const m: Array<'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'> = [];
	if (n.bold) m.push('bold');
	if (n.italic) m.push('italic');
	if (n.underline) m.push('underline');
	if (n.strikethrough) m.push('strikethrough');
	if (n.code) m.push('code');
	return m;
}

export function mergeComponents<T>(def: T, over?: Partial<T>): T {
	return over ? { ...def, ...over } : def;
}

export function generateBlockKey(node: BlockNode, idx: number): string {
	if (node.type === 'image' && node.image.hash) {
		return `img-${node.image.hash}-${idx}`;
	}
	return `${node.type}-${idx}`;
}

export interface TextNode {
	type: 'text';
	text: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	code?: boolean;
}

export interface LinkNode {
	type: 'link';
	url: string;
	children: (TextNode | LinkNode)[];
}

export type InlineNode = TextNode | LinkNode | SkyblockItemBlockNode | ItemPriceBlockNode;

export interface ParagraphBlockNode {
	type: 'paragraph';
	children: InlineNode[];
}

export interface HeadingBlockNode {
	type: 'heading';
	level: 1 | 2 | 3 | 4 | 5 | 6;
	children: InlineNode[];
}

export interface QuoteBlockNode {
	type: 'quote';
	children: InlineNode[];
}

export interface CodeBlockNode {
	type: 'code';
	children: TextNode[];
}

export interface ImageBlockNode {
	type: 'image';
	image: {
		name: string;
		alternativeText?: string;
		url: string;
		caption?: string;
		width?: number;
		height?: number;
		formats?: Record<string, unknown>;
		hash: string;
		ext: string;
		mime: string;
		size: number;
		provider: string;
		provider_metadata?: Record<string, unknown>;
		createdAt: string;
		updatedAt: string;
	};
}

export interface SkyblockItemBlockNode {
	type: 'skyblock-item';
	skyblockId: string;
	size?: 'sm' | 'md' | 'lg';
	inline?: boolean;
	pet?: boolean;
}

export interface ItemPriceBlockNode {
	type: 'item-price';
	skyblockId: string;
	multiplier?: number;
}

export interface TwoColumnBlockNode {
	type: 'two-column';
	variant?: 'plain' | 'bordered';
	left: BlockNode[];
	right: BlockNode[];
}

export interface YouTubeBlockNode {
	type: 'youtube';
	videoId: string;
}

export type CalloutVariant = 'note' | 'tip' | 'warning' | 'danger' | 'success' | 'question' | 'example' | 'quote';

export interface CalloutBlockNode {
	type: 'callout';
	variant: CalloutVariant;
	children: BlockNode[];
}

export interface AccordionBlockNode {
	type: 'accordion';
	title: string;
	children: BlockNode[];
}

export interface ListItemBlockNode {
	type: 'list-item';
	children: InlineNode[];
}

export interface ListBlockNode {
	type: 'list';
	format: 'ordered' | 'unordered';
	children: (ListItemBlockNode | ListBlockNode)[];
	indentLevel?: number;
}

export interface RecipeSlot {
	skyblockId?: string;
	count?: number;
}

export interface RecipeBlockNode {
	type: 'recipe';
	grid: RecipeSlot[];
	output: RecipeSlot;
}

export interface ItemListItem {
	skyblockId: string;
	quantity: number;
}

export interface ItemListBlockNode {
	type: 'item-list';
	items: ItemListItem[];
}

export interface TableBlockNode {
	type: 'table';
	rows: number;
	cols: number;
	cells: RootNode[][];
}

export interface BlockGridCell {
	blockName?: string;
	overlayItem?: string;
}

export interface BlockGridBlockNode {
	type: 'block-grid';
	rows: number;
	cols: number;
	cells: BlockGridCell[][];
}

export type BlockNode =
	| ParagraphBlockNode
	| HeadingBlockNode
	| QuoteBlockNode
	| CodeBlockNode
	| ImageBlockNode
	| ListBlockNode
	| ListItemBlockNode
	| SkyblockItemBlockNode
	| ItemPriceBlockNode
	| TwoColumnBlockNode
	| YouTubeBlockNode
	| CalloutBlockNode
	| AccordionBlockNode
	| RecipeBlockNode
	| ItemListBlockNode
	| TableBlockNode
	| BlockGridBlockNode;

export type RootNode = BlockNode[];

export interface BlockComponents {
	paragraph: Component<ParagraphProps>;
	heading: Component<HeadingProps>;
	quote: Component<QuoteProps>;
	code: Component<CodeProps>;
	image: Component<ImageProps>;
	list: Component<ListProps>;
	'list-item': Component<ListItemProps>;
	'skyblock-item': Component<SkyblockItemProps>;
	'item-price': Component<ItemPriceProps>;
	'two-column': Component<TwoColumnProps>;
	youtube: Component<YouTubeProps>;
	callout: Component<CalloutProps>;
	accordion: Component<AccordionProps>;
	recipe: Component<RecipeProps>;
	'item-list': Component<ItemListProps>;
	table: Component<TableProps>;
	'block-grid': Component<BlockGridProps>;
}

export interface SkyblockItemProps extends BlockComponentProps {
	node: SkyblockItemBlockNode;
}

export interface ItemPriceProps {
	node: ItemPriceBlockNode;
}

export interface TwoColumnProps {
	node: TwoColumnBlockNode;
}

export interface YouTubeProps {
	node: YouTubeBlockNode;
}

export interface CalloutProps {
	node: CalloutBlockNode;
}

export interface AccordionProps {
	node: AccordionBlockNode;
}

export interface RecipeProps {
	node: RecipeBlockNode;
}

export interface ItemListProps {
	node: ItemListBlockNode;
}

export interface TableProps {
	node: TableBlockNode;
}

export interface BlockGridProps {
	node: BlockGridBlockNode;
}

export interface ModifierProps {
	children?: Snippet;
	node?: TextNode | LinkNode;
}

export interface LinkProps extends ModifierProps {
	url: string;
	node?: LinkNode;
}

export interface ModifierComponents {
	bold: Component<ModifierProps>;
	italic: Component<ModifierProps>;
	underline: Component<ModifierProps>;
	strikethrough: Component<ModifierProps>;
	code: Component<ModifierProps>;
	link: Component<LinkProps>;
}

export interface BlockComponentProps {
	node: BlockNode;
	index: number;
	modifiers: ModifierComponents;
}

export interface BlocksRendererProps {
	content: RootNode;
	blocks?: Partial<BlockComponents>;
	modifiers?: Partial<ModifierComponents>;
}

export interface ParagraphProps extends BlockComponentProps {
	node: ParagraphBlockNode;
}

export interface HeadingProps extends BlockComponentProps {
	node: HeadingBlockNode;
}

export interface QuoteProps extends BlockComponentProps {
	node: QuoteBlockNode;
}

export interface CodeProps extends BlockComponentProps {
	node: CodeBlockNode;
}

export interface ImageProps extends BlockComponentProps {
	node: ImageBlockNode;
}

export interface ListProps extends BlockComponentProps {
	node: ListBlockNode;
	indentLevel?: number;
}

export interface ListItemProps extends BlockComponentProps {
	node: ListItemBlockNode;
}

export interface InlineRendererProps {
	nodes: InlineNode[];
	modifiers: ModifierComponents;
}

export interface TextRendererProps {
	node: TextNode;
	modifiers: ModifierComponents;
}
