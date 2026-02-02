import { SortHypixelGuildsBy } from '$lib/api';
import { cache } from '$lib/servercache';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	let page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1;
	if (isNaN(page) || page < 1) {
		page = 1;
	}

	let pageSize = url.searchParams.get('size') ? Number(url.searchParams.get('size')) : 10;
	if (isNaN(pageSize) || pageSize < 1) {
		pageSize = 10;
	} else if (pageSize > 50) {
		pageSize = 50;
	}

	let sortBy = url.searchParams.get('sort')
		? String(url.searchParams.get('sort'))
		: SortHypixelGuildsBy.skyblockExperienceAverage;
	if (!Object.values(SortHypixelGuildsBy).includes(sortBy as SortHypixelGuildsBy)) {
		sortBy = SortHypixelGuildsBy.skyblockExperienceAverage;
	}

	const cached = cache.topguilds;

	return { ...cached, page: page - 1, pageSize, sortBy };
}) satisfies PageServerLoad;
