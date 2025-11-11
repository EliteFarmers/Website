import { fetchArticlesPaginated } from '$lib/api/cms';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1;
	const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 15;
	const sort = url.searchParams.get('sort') || 'desc';
	const catgeory = url.searchParams.get('category') || undefined;

	const defaultArticles = await fetchArticlesPaginated(page, limit, sort === 'asc', catgeory);

	return { defaultArticles: defaultArticles.data, defaultMeta: defaultArticles.meta };
}) satisfies PageServerLoad;
