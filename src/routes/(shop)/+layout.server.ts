import { getShopStorefront } from '$lib/shop/storefront';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const products = locals.cache?.products?.list ?? [];
	const categories = locals.cache?.shopCategories ?? [];
	const badges = locals.cache?.badges ?? [];

	return {
		products,
		styles: locals.cache?.styles ?? [],
		categories,
		badges,
		storefront: getShopStorefront({
			products,
			categories,
		}),
	};
}) satisfies LayoutServerLoad;
