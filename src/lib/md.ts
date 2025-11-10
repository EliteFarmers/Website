import { ORIGIN } from '$env/static/private';
import DOMPurify from 'isomorphic-dompurify';
import { parse, parseInline } from 'marked';
import { createRawSnippet } from 'svelte';

if (!ORIGIN) {
	// This is just to make sure this module can't be imported into the browser
}

export async function mdToHtml(markdown: string) {
	const html = await parse(markdown, { breaks: true });
	const sanitized = DOMPurify.sanitize(html);

	return sanitized;
}

export async function mdToInline(markdown: string) {
	const html = await parseInline(markdown, { breaks: true });
	const sanitized = DOMPurify.sanitize(html);

	return sanitized;
}

export async function mdToSnippet(markdown: string) {
	const html = await mdToHtml(markdown);
	if (!html) return null;
	return createRawSnippet(() => ({ render: () => html }));
}
