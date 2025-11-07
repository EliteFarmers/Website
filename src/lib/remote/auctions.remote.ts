import { query } from '$app/server';
import {
	getAuctionHouseOverview,
	getAuctionPriceHistory,
	getAuctionVariants,
	type GetAuctionPriceHistoryResponse,
} from '$lib/api';
import * as z from 'zod';

export const getAuctionsOverview = query(async () => {
	const response = await getAuctionHouseOverview();
	return response.data;
});

export const getAuctionItem = query(z.string(), async (itemId: string) => {
	const response = await getAuctionVariants(itemId);
	const variants = response.data?.variants ?? [];

	const result = {
		variants: variants,
		history: {} as Record<string, GetAuctionPriceHistoryResponse | undefined>,
	};

	for (const variant of variants) {
		const key = variant.variantKey ? variant.variantKey : 'default';
		console.log('Fetching history for variant:', key);
		result.history[key] = (await getAuctionPriceHistory(itemId, key)).data;
	}

	return result;
});
