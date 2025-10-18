import { getBadges, getCategories } from '$lib/api';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	return {
		products: locals.cache?.products ?? [],
		styles: locals.cache?.styles ?? [],
		categories:
			(await getCategories({ includeProducts: true })
				.then((res) => res.data)
				.catch(() => undefined)) ?? [],
		badges:
			(await getBadges()
				.then((res) => res.data)
				.catch(() => undefined)) ?? [],
	};
}) satisfies LayoutServerLoad;
