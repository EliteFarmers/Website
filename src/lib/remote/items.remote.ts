import { query } from '$app/server';
import type { RatesItemPriceData } from '$lib/api/elite';
import { cache } from '$lib/servercache';
import z from 'zod';

export const getItems = query(z.array(z.string()), async (items) => {
	if (!items?.length) {
		return {};
	}

	const bz = cache?.bazaar.products;
	const ah = cache?.auctions.items;
	const sbItems = cache?.items;

	const result: RatesItemPriceData = {};

	for (const id of items) {
		result[id] = {
			auctions: ah?.[id],
			bazaar: bz?.[id],
			item: sbItems?.[id] ?? undefined,
		};
	}

	return result;
});
