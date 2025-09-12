import { query } from '$app/server';
import { mdToHtml } from '$lib/md';
import * as zod from 'zod';

export const getHtmlFromMarkdown = query(zod.string(), async (markdown: string) => {
	return await mdToHtml(markdown);
});
