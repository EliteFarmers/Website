import type { RootNode } from '$comp/blocks/blocks';
import { env } from '$env/dynamic/private';
import { fetchArticleBySlug } from '$lib/api/cms';
import { renderInlineMarkdownInBlocks } from '$lib/md';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
const { STRAPI_API_URL, STRAPI_TOKEN } = env;

export const load = (async ({ params }) => {
	if (!STRAPI_API_URL || !STRAPI_TOKEN) throw error(500, 'Strapi environment variables are not set');

	const { slug } = params;

	const data = await fetchArticleBySlug(slug);

	const articleContent = data?.content;
	if (articleContent) {
		data.content = await renderInlineMarkdownInBlocks(data.content as RootNode);
	}

	if (!data) {
		throw error(404, 'Article not found');
	}

	return {
		article: data,
	};
}) satisfies PageServerLoad;
