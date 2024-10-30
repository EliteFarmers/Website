import { GetAllBadges, GetProducts } from '$lib/api/elite';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ setHeaders }) => {
	setHeaders({
		'Cache-Control': 'no-store',
	});

	const { data: badges } = await GetAllBadges().catch(() => ({ data: undefined }));
	const { data: products } = await GetProducts().catch(() => ({ data: undefined }));

	return {
		badges: badges ?? [],
		products: products ?? [],
	};
}) satisfies LayoutServerLoad;
