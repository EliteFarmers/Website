import type { BlockNode, RootNode } from '$comp/blocks/blocks';
import type { JSONContent } from '@tiptap/core';

export function guideContentReferencesAsset(content: RootNode | string | null | undefined, assetId: string) {
	if (!assetId || !content) return false;

	if (Array.isArray(content)) {
		return guideBlocksReferenceAsset(content, assetId);
	}

	const trimmed = content.trim();
	if (!trimmed.startsWith('[')) return false;

	try {
		const parsed = JSON.parse(trimmed);
		return Array.isArray(parsed) && guideBlocksReferenceAsset(parsed as RootNode, assetId);
	} catch {
		return false;
	}
}

export function guideBlocksReferenceAsset(content: RootNode | null | undefined, assetId: string) {
	if (!assetId || !content) return false;
	return content.some((block) => blockReferencesAsset(block, assetId));
}

export function tiptapContentReferencesAsset(content: JSONContent | null | undefined, assetId: string) {
	if (!assetId || !content) return false;
	return tiptapNodeReferencesAsset(content, assetId);
}

function blockReferencesAsset(block: BlockNode, assetId: string): boolean {
	switch (block.type) {
		case 'image':
			return block.image.assetId === assetId;
		case 'litematic':
			return block.assetId === assetId;
		case 'two-column':
			return guideBlocksReferenceAsset(block.left, assetId) || guideBlocksReferenceAsset(block.right, assetId);
		case 'callout':
		case 'accordion':
			return guideBlocksReferenceAsset(block.children, assetId);
		case 'list':
			return block.children.some((child) => blockReferencesAsset(child, assetId));
		case 'table':
			return block.cells.some((row) => row.some((cell) => guideBlocksReferenceAsset(cell, assetId)));
		default:
			return false;
	}
}

function tiptapNodeReferencesAsset(node: JSONContent, assetId: string): boolean {
	if ((node.type === 'image' || node.type === 'litematic') && node.attrs?.assetId === assetId) {
		return true;
	}

	return node.content?.some((child) => tiptapNodeReferencesAsset(child, assetId)) ?? false;
}
