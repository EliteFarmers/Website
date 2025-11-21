import { cache } from '$lib/servercache';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const productId = params.itemId;
	const product = cache.bazaar?.products?.[productId];

	if (!product) {
		error(404, 'Bazaar item not found');
	}

	return {
		item: product ? { ...product, id: productId } : undefined,
	};
};
