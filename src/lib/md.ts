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
