import type { RootNode } from '$comp/blocks/blocks';
import { env } from '$env/dynamic/private';
import { clearWindow, sanitize } from 'isomorphic-dompurify';
import { parse, parseInline } from 'marked';
import { createRawSnippet } from 'svelte';
const { ORIGIN } = env;

if (!ORIGIN) {
	// This is just to make sure this module can't be imported into the browser
}

let lastClearTime = 0;

function clear() {
	const now = Date.now();
	if (now - lastClearTime > 1000) {
		lastClearTime = now;
		clearWindow();
	}
}

export async function mdToHtml(markdown: string) {
	try {
		const html = await parse(markdown, { breaks: true });
		const sanitized = sanitize(html);
		clear();

		return sanitized;
	} catch (error) {
		console.error('Error parsing markdown:', error);
		return '';
	}
}

export async function mdToInline(markdown: string) {
	try {
		const html = await parseInline(markdown, { breaks: true });
		const sanitized = sanitize(html);
		clear();

		return sanitized;
	} catch (error) {
		console.error('Error parsing inline markdown:', error);
		return '';
	}
}

export async function mdToSnippet(markdown: string) {
	const html = await mdToHtml(markdown);
	if (!html) return null;
	return createRawSnippet(() => ({ render: () => html }));
}

export async function renderInlineMarkdownInBlocks(content: RootNode): Promise<RootNode> {
	try {
		const cloned = structuredClone(content);
		await renderNodeListInlineMarkdown(cloned);
		return cloned;
	} catch (error) {
		console.error('Error rendering inline markdown in blocks:', error);
		return content;
	}
}

async function renderNodeListInlineMarkdown(nodes: unknown[]) {
	for (const node of nodes) {
		await renderNodeInlineMarkdown(node);
	}
}

async function renderNodeInlineMarkdown(node: unknown) {
	if (!node || typeof node !== 'object') return;

	const record = node as Record<string, unknown>;
	if (record.type === 'code') return;

	if (record.type === 'text' && typeof record.text === 'string') {
		record.text = await mdToInline(record.text);
		return;
	}

	if (Array.isArray(record.children)) {
		await renderNodeListInlineMarkdown(record.children);
	}

	if (Array.isArray(record.left)) {
		await renderNodeListInlineMarkdown(record.left);
	}

	if (Array.isArray(record.right)) {
		await renderNodeListInlineMarkdown(record.right);
	}

	if (Array.isArray(record.cells)) {
		for (const row of record.cells) {
			if (!Array.isArray(row)) continue;
			for (const cell of row) {
				if (Array.isArray(cell)) {
					await renderNodeListInlineMarkdown(cell);
				}
			}
		}
	}
}
