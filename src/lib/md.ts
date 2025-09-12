import { ORIGIN } from '$env/static/private';
import DOMPurify from 'isomorphic-dompurify';
import { parse } from 'marked';
import { createRawSnippet } from 'svelte';

if (!ORIGIN) {
	// This is just to make sure this module can't be imported into the browser
}

export async function mdToHtml(markdown: string) {
	const html = await parse(markdown, { breaks: true });
	const sanitized = DOMPurify.sanitize(html);

	return sanitized;
}

export async function mdToSnippet(markdown: string) {
	const html = await mdToHtml(markdown);
	if (!html) return null;
	return createRawSnippet(() => ({ render: () => html }));
}
