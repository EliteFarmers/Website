import type { BlockNode, InlineNode, ListBlockNode, ListItemBlockNode, RootNode, TextNode } from '$comp/blocks/blocks';

export interface GuideHoistTarget {
	id: string;
	label: string;
}

function createGuideBlockId() {
	const uuid =
		globalThis.crypto?.randomUUID?.().replaceAll('-', '') ??
		`${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
	return `blk_${uuid.slice(0, 24)}`;
}

function normalizeBlockId(value: unknown) {
	return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function nextUniqueBlockId(usedIds: Set<string>) {
	let id = createGuideBlockId();
	while (usedIds.has(id)) {
		id = createGuideBlockId();
	}

	usedIds.add(id);
	return id;
}

function ensureId(id: unknown, usedIds: Set<string>) {
	const normalized = normalizeBlockId(id);
	if (!normalized || usedIds.has(normalized)) {
		return nextUniqueBlockId(usedIds);
	}

	usedIds.add(normalized);
	return normalized;
}

export function ensureGuideBlockIds(content: RootNode): RootNode {
	const usedIds = new Set<string>();
	return content.map((block) => ensureBlockId(block, usedIds));
}

function ensureBlockId<T extends BlockNode>(block: T, usedIds: Set<string>): T {
	const id = ensureId(block.id, usedIds);

	switch (block.type) {
		case 'two-column':
			return {
				...block,
				id,
				left: block.left.map((child) => ensureBlockId(child, usedIds)),
				right: block.right.map((child) => ensureBlockId(child, usedIds)),
			} as T;
		case 'callout':
		case 'accordion':
			return {
				...block,
				id,
				children: block.children.map((child) => ensureBlockId(child, usedIds)),
			} as T;
		case 'list':
			return {
				...block,
				id,
				children: block.children.map((child) => ensureListChildId(child, usedIds)),
			} as T;
		case 'table':
			return {
				...block,
				id,
				cells: block.cells.map((row) => row.map((cell) => cell.map((child) => ensureBlockId(child, usedIds)))),
			} as T;
		default:
			return { ...block, id };
	}
}

function ensureListChildId(child: ListBlockNode | ListItemBlockNode, usedIds: Set<string>) {
	return ensureBlockId(child, usedIds);
}

export function collectGuideHoistTargets(content: RootNode): GuideHoistTarget[] {
	const targets: GuideHoistTarget[] = [];
	collectTargets(content, targets);
	return targets;
}

function collectTargets(content: RootNode, targets: GuideHoistTarget[]) {
	for (const block of content) {
		addTarget(block, targets);

		switch (block.type) {
			case 'two-column':
				collectTargets(block.left, targets);
				collectTargets(block.right, targets);
				break;
			case 'callout':
			case 'accordion':
				collectTargets(block.children, targets);
				break;
			case 'list':
				for (const child of block.children) {
					if (child.type === 'list') {
						collectTargets([child], targets);
					} else {
						addTarget(child, targets);
					}
				}
				break;
			case 'table':
				for (const row of block.cells) {
					for (const cell of row) {
						collectTargets(cell, targets);
					}
				}
				break;
		}
	}
}

function addTarget(block: BlockNode, targets: GuideHoistTarget[]) {
	if (!isMeaningfulBlock(block) || !block.id) return;
	targets.push({
		id: block.id,
		label: getBlockLabel(block),
	});
}

function isMeaningfulBlock(block: BlockNode) {
	if (!block.id) return false;
	if (block.type === 'paragraph' || block.type === 'list-item' || block.type === 'quote') {
		return getTextFromInlineNodes(block.children).trim().length > 0;
	}
	if (block.type === 'code') {
		return block.children.some((child) => child.text.trim().length > 0);
	}

	return true;
}

export function getTextFromInlineNodes(nodes: InlineNode[]): string {
	return nodes
		.map((node) => {
			if (node.type === 'text') return node.text;
			if (node.type === 'link') return getTextFromInlineNodes(node.children);
			if (node.type === 'skyblock-item') return node.skyblockId;
			if (node.type === 'item-price') return `${node.skyblockId} price`;
			if (node.type === 'wiki-link') return node.pageName;
			return '';
		})
		.join('');
}

function getTextSnippet(text: string) {
	const normalized = text.replace(/\s+/g, ' ').trim();
	if (!normalized) return '';
	return normalized.length > 72 ? `${normalized.slice(0, 69)}...` : normalized;
}

function getTextNodeSnippet(children: TextNode[]) {
	return getTextSnippet(children.map((child) => child.text).join(''));
}

function getBlockLabel(block: BlockNode) {
	switch (block.type) {
		case 'heading':
			return getTextSnippet(getTextFromInlineNodes(block.children)) || 'Heading';
		case 'paragraph':
			return `Paragraph: ${getTextSnippet(getTextFromInlineNodes(block.children))}`;
		case 'quote':
			return `Quote: ${getTextSnippet(getTextFromInlineNodes(block.children))}`;
		case 'code':
			return `Code: ${getTextNodeSnippet(block.children) || 'block'}`;
		case 'image':
			return `Image: ${block.image.caption || block.image.alternativeText || block.image.name || 'uploaded image'}`;
		case 'litematic':
			return `Litematic: ${block.name || block.fileName || 'schematic'}`;
		case 'list':
			return `${block.format === 'ordered' ? 'Ordered' : 'Bulleted'} list`;
		case 'list-item':
			return `List item: ${getTextSnippet(getTextFromInlineNodes(block.children))}`;
		case 'skyblock-item':
			return `Item: ${block.skyblockId}`;
		case 'item-price':
			return `Price: ${block.skyblockId}`;
		case 'two-column':
			return 'Two-column section';
		case 'youtube':
			return 'YouTube video';
		case 'callout':
			return `${block.variant.charAt(0).toUpperCase()}${block.variant.slice(1)} callout`;
		case 'accordion':
			return `Accordion: ${block.title}`;
		case 'recipe':
			return `Recipe: ${block.output.skyblockId || 'crafting recipe'}`;
		case 'item-list':
			return 'Item list';
		case 'credits':
			return 'Credits';
		case 'table':
			return 'Table';
		case 'block-grid':
			return 'Block grid';
		default:
			return 'Guide block';
	}
}
