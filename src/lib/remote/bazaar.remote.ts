import { query } from '$app/server';
import {
	getBazaarOverview as getBazaarOverviewApi,
	getBazaarProduct,
	getBazaarProductHistory,
	searchBazaarProducts as searchBazaarProductsApi,
} from '$lib/api';
import { cache } from '$lib/servercache';
import * as z from 'zod';

export const getBazaarOverview = query(async () => {
	const response = await getBazaarOverviewApi();
	return response.data;
});

export const searchBazaarProducts = query(
	z.object({
		query: z.string(),
		limit: z.number().int().positive().optional(),
	}),
	async ({ query, limit }) => {
		const trimmed = query.trim();
		if (!trimmed) {
			return [];
		}

		const response = await searchBazaarProductsApi({
			query: trimmed,
			limit: limit ?? 60,
		});

		return (response.data?.products ?? []).map((product) => ({
			productId: product.itemId,
			...product.summary,
		}));
	}
);

export const getBazaarItem = query(z.string(), async (itemId: string) => {
	const upperItemId = itemId.toUpperCase();
	const resolvedItemId = cache.bazaar?.products?.[itemId] ? itemId : upperItemId;

	const cachedProduct = cache.bazaar?.products?.[resolvedItemId];

	let product = cachedProduct;
	if (!product?.orders) {
		const productResponse = await getBazaarProduct(resolvedItemId).catch(() => null);
		product = productResponse?.data?.product ?? product;
	}

	if (!product) {
		return null;
	}

	const historyResponse = await getBazaarProductHistory(resolvedItemId, { timespan: '1w' }).catch(() => null);

	return {
		product,
		history: historyResponse?.data ?? null,
	};
});
