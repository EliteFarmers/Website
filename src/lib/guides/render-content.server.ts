import type { RootNode } from '$comp/blocks/blocks';
import { mdToHtml, renderInlineMarkdownInBlocks } from '$lib/md';
import type { RenderedGuideContent } from './types';

type GuideWithContent = {
	content?: string | null;
};

export async function renderGuideContentForDisplay<T extends GuideWithContent>(
	guide: T
): Promise<T & RenderedGuideContent> {
	const rendered = await renderGuideContent(guide.content);
	return {
		...guide,
		...rendered,
	};
}

async function renderGuideContent(content: string | null | undefined): Promise<RenderedGuideContent> {
	const blocks = parseGuideBlocks(content);
	if (blocks) {
		return {
			renderedBlocks: await renderInlineMarkdownInBlocks(blocks),
			renderedHtml: null,
		};
	}

	return {
		renderedBlocks: null,
		renderedHtml: await mdToHtml(content ?? ''),
	};
}

function parseGuideBlocks(content: string | null | undefined): RootNode | null {
	const trimmed = content?.trim();
	if (!trimmed || (!trimmed.startsWith('[') && !trimmed.startsWith('{'))) return null;

	try {
		const parsed = JSON.parse(trimmed);
		return Array.isArray(parsed) ? (parsed as RootNode) : null;
	} catch {
		return null;
	}
}
