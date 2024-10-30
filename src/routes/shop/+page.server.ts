import { GetProducts, GetWeightStyles } from '$lib/api/elite';
import type { PageServerLoad } from './$types';

export const load = (async ({ setHeaders }) => {
	// 30 minute public cache
	setHeaders({ 'Cache-Control': 'public, max-age=1800' });

	return {
		products:
			(await GetProducts()
				.then((res) => res.data)
				.catch(() => undefined)) ?? [],
		styles:
			(await GetWeightStyles()
				.then((res) => res.data)
				.catch(() => undefined)) ?? [],
	};
}) satisfies PageServerLoad;
