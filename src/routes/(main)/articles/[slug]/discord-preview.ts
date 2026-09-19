import { env } from '$env/dynamic/public';
import type { fetchArticleBySlug } from '$lib/api/cms';
import { previewText, type PreviewCard } from '$lib/discord-preview';
export function createPreview({
	article,
}: {
	article: NonNullable<Awaited<ReturnType<typeof fetchArticleBySlug>>>;
}): PreviewCard {
	return {
		title: article.title || 'Elite article',
		description: article.summary,
		image: article.cover?.url
			? new URL(article.cover.url, env.PUBLIC_STRAPI_API_URL).href
			: '/images/default-farming-news.png',
		lines: [article.author?.name && '-# By ' + previewText(article.author.name)],
		links: [{ label: 'Read article', path: '/articles/' + article.slug }],
	};
}
