import { query } from '$app/server';
import {
	getAuctionHouseOverview,
	getAuctionPriceHistory,
	getItemEndedAuctions as getItemEndedAuctionsApi,
	getPopularAuctions,
	type GetAuctionPriceHistoryResponse,
} from '$lib/api';
import { cache } from '$lib/servercache';
import * as z from 'zod';

export const getAuctionsOverview = query(async () => {
	const response = await getAuctionHouseOverview();
	return response.data;
});

export const getAuctions = query(async () => {
	const response = await getPopularAuctions({ timespan: '1d', page: 0, pageSize: 20 });
	return response.data;
});

export const getItemEndedAuctions = query(z.string(), async (itemId: string) => {
	const response = await getItemEndedAuctionsApi(itemId, { limit: 10 });
	return response.data;
});

export const getItemEndedAuctionsByVariant = query(
	z.object({
		itemId: z.string(),
		variant: z.string().optional(),
		limit: z.number().int().positive().optional(),
	}),
	async ({ itemId, variant, limit }) => {
		const response = await getItemEndedAuctionsApi(itemId, {
			limit: limit ?? 10,
			variant,
		});
		return response.data;
	}
);

export const getAuctionItem = query(z.string(), async (itemId: string) => {
	const variants = cache.auctions?.items?.[itemId] ?? [];

	const result = {
		variants: variants,
		history: {} as Record<string, GetAuctionPriceHistoryResponse | undefined>,
	};

	for (const variant of variants) {
		const key = variant.variantKey ? variant.variantKey : 'default';
		result.history[key] = (await getAuctionPriceHistory(itemId, key).catch(() => null))?.data;
	}

	return result;
});
