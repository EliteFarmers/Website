import { getBadges, getCategories } from '$lib/api';
import { getPlaceholderShopStorefront } from '$lib/shop/storefront';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const products = locals.cache?.products ?? [];

	const [categories, badges] = await Promise.all([
		getCategories({ includeProducts: true })
			.then((res) => res.data ?? [])
			.catch(() => [] as never[]),
		getBadges()
			.then((res) => res.data ?? [])
			.catch(() => [] as never[]),
	]);

	return {
		products,
		styles: locals.cache?.styles ?? [],
		categories,
		badges,
		storefront: getPlaceholderShopStorefront({
			products,
			categories,
		}),
	};
}) satisfies LayoutServerLoad;
