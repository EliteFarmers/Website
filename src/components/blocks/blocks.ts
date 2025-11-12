import type { Component, Snippet } from 'svelte';

export function isTextNode(n: InlineNode): n is TextNode {
	return n?.type === 'text';
}

export function isLinkNode(n: InlineNode): n is LinkNode {
	return n?.type === 'link';
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
		return `img-${node.image.hash}`;
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

export type InlineNode = TextNode | LinkNode;

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

export type BlockNode =
	| ParagraphBlockNode
	| HeadingBlockNode
	| QuoteBlockNode
	| CodeBlockNode
	| ImageBlockNode
	| ListBlockNode
	| ListItemBlockNode;

export type RootNode = BlockNode[];

export interface BlockComponents {
	paragraph: Component<ParagraphProps>;
	heading: Component<HeadingProps>;
	quote: Component<QuoteProps>;
	code: Component<CodeProps>;
	image: Component<ImageProps>;
	list: Component<ListProps>;
	'list-item': Component<ListItemProps>;
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
