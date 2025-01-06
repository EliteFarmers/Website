import { GetAllBadges, GetProducts, GetShopCategories, GetWeightStyles } from '$lib/api/elite';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ setHeaders, locals }) => {
	// 30 minute public cache
	if (!locals.session) {
		setHeaders({ 'Cache-Control': 'public, max-age=1800' });
	}

	return {
		products:
			(await GetProducts()
				.then((res) => res.data)
				.catch(() => undefined)) ?? [],
		categories:
			(await GetShopCategories()
				.then((res) => res.data)
				.catch(() => undefined)) ?? [],
		styles:
			(await GetWeightStyles()
				.then((res) => res.data)
				.catch(() => undefined)) ?? [],
		badges:
			(await GetAllBadges()
				.then((res) => res.data)
				.catch(() => undefined)) ?? [],
	};
}) satisfies LayoutServerLoad;
