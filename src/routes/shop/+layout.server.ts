import { GetAllBadges, GetShopCategories } from '$lib/api/elite';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ setHeaders, locals }) => {
	// 30 minute public cache
	if (!locals.session?.flags.admin) {
		setHeaders({ 'Cache-Control': 'public, max-age=1800' });
	}

	return {
		products: locals.cache?.products ?? [],
		styles: locals.cache?.styles ?? [],
		categories:
			(await GetShopCategories(true)
				.then((res) => res.data)
				.catch(() => undefined)) ?? [],
		badges:
			(await GetAllBadges()
				.then((res) => res.data)
				.catch(() => undefined)) ?? [],
	};
}) satisfies LayoutServerLoad;
