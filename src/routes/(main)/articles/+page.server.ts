import { fetchArticlesPaginated } from '$lib/api/cms';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const defaultArticles = await fetchArticlesPaginated(1, 30);

	return { defaultArticles: defaultArticles.data, defaultMeta: defaultArticles.meta };
}) satisfies PageServerLoad;
