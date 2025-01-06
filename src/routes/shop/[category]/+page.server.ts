import { GetShopCategory } from '$lib/api/elite';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const { category } = params;

	const { data } = await GetShopCategory(category);

	return {
		category: data,
	};
}) satisfies PageServerLoad;
