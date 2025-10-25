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

export const getItemValue = query.batch(z.string(), async (itemIds) => {
	const lookup = new Map(itemIds.map((id) => [id, getSingleItemValue(id)]));
	return (itemId) => lookup.get(itemId) ?? { ah: 0, bazaar: 0, npc: 0, lowest: 0 };
});

function getSingleItemValue(itemId: string) {
	const bz = cache?.bazaar.products;
	const ah = cache?.auctions.items;

	const npcPrice = bz?.[itemId]?.npc ?? 0;
	const ahPrice = Math.min(...(ah?.[itemId]?.filter((a) => a.lowest3Day !== -1).map((a) => a.lowest3Day) ?? [0]));
	const bazaarPrice = bz?.[itemId]?.averageSellOrder ?? 0;

	const lowestValue = Math.max(
		npcPrice,
		Math.min(ahPrice ? ahPrice : npcPrice, bazaarPrice ? bazaarPrice : npcPrice)
	);

	return {
		ah: ahPrice,
		bazaar: bazaarPrice,
		npc: npcPrice,
		lowest: lowestValue,
	};
}
