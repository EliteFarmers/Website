import type { BlockNode, InlineNode, RootNode } from '$comp/blocks/blocks';
import { STRAPI_API_URL, STRAPI_TOKEN } from '$env/static/private';
import { fetchArticleBySlug } from '$lib/api/cms';
import { mdToInline } from '$lib/md';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	if (!STRAPI_API_URL || !STRAPI_TOKEN) throw error(500, 'Strapi environment variables are not set');

	const { slug } = params;

	const data = await fetchArticleBySlug(slug);

	const articleContent = data?.content;
	if (articleContent) {
		data.content = await hydrateMarkdown(data.content as RootNode);
	}

	if (!data) {
		throw error(404, 'Article not found');
	}

	return {
		article: data,
	};
}) satisfies PageServerLoad;

async function hydrateMarkdown(content: RootNode) {
	for (const node of content) {
		if (!('children' in node)) continue;
		await hydrateChild(node);
	}
	return content;
}

async function hydrateChild(child: InlineNode | BlockNode) {
	if ('children' in child && child.children) {
		for (const grandChild of child.children) {
			await hydrateChild(grandChild);
		}
	}

	if (child.type === 'text') {
		child.text = await mdToInline(child.text);
	}

	return child;
}
