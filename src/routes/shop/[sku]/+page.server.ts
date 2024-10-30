import { GetProducts, GetWeightStyles } from '$lib/api/elite';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {
		products: await GetProducts()
			.then((res) => res.data)
			.catch(() => []),
		styles: await GetWeightStyles()
			.then((res) => res.data)
			.catch(() => []),
	};
}) satisfies PageServerLoad;
