import { query } from '$app/server';
import {
	getBazaarOverview as getBazaarOverviewApi,
	getBazaarProduct,
	getBazaarProductHistory,
	getBazaarProducts,
} from '$lib/api';
import * as z from 'zod';

export const getAllBazaarProducts = query(async () => {
	const response = await getBazaarProducts();
	const products = response?.data?.products ?? {};
	return Object.entries(products).map(([key, value]) => ({
		productId: key,
		...value,
	}));
});

export const getBazaarOverview = query(async () => {
	const response = await getBazaarOverviewApi();
	return response.data;
});

export const getBazaarItem = query(z.string(), async (itemId: string) => {
	console.log(`Fetching bazaar item: ${itemId}`);
	try {
		const productResponse = await getBazaarProduct(itemId);
		const historyResponse = await getBazaarProductHistory(itemId, { timespan: '1w' });

		if (!productResponse.data) {
			throw new Error('Product not found');
		}

		console.log(`Fetched bazaar item: ${itemId}`, productResponse.data, historyResponse.data);

		return {
			product: productResponse.data.product,
			history: historyResponse.data,
		};
	} catch (error) {
		console.error(`Error fetching bazaar item ${itemId}:`, error);
		throw error;
	}
});
