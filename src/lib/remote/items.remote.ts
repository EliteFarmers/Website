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

export const getItem = query.batch(z.string(), async (itemIds) => {
	const bz = cache?.bazaar.products;
	const ah = cache?.auctions.items;
	const sbItems = cache?.items;

	const lookup = new Map(
		itemIds.map((id) => [
			id,
			{
				auctions: ah?.[id],
				bazaar: bz?.[id],
				item: sbItems?.[id] ?? undefined,
			},
		])
	);

	return (itemId: string) => lookup.get(itemId) ?? { auctions: undefined, bazaar: undefined, item: undefined };
});

export const getItemValue = query.batch(z.string(), async (itemIds) => {
	const lookup = new Map(itemIds.map((id) => [id, getSingleItemValue(id)]));
	return (itemId) => lookup.get(itemId) ?? { ah: 0, bazaar: 0, npc: 0, lowest: 0, name: undefined };
});

export const getItemValues = query(z.array(z.string()), async (itemIds) => {
	return new Map(itemIds.map((id) => [id, getSingleItemValue(id)]));
});

function getSingleItemValue(itemId: string) {
	const bz = cache?.bazaar.products;
	const ah = cache?.auctions.items;
	const item = cache?.items?.[itemId];

	const npcPrice = bz?.[itemId]?.npc || item?.npc_sell_price || 0;
	const ahPrices = ah?.[itemId]?.filter((a) => a.lowest > 0).map((a) => a.lowest) ?? [];
	const ahPrice = ahPrices.length > 0 ? Math.min(...ahPrices) : 0;
	const bazaarPrice = bz?.[itemId]?.averageSellOrder ?? 0;

	const values = [ahPrice, bazaarPrice].filter((v) => v > 0);
	const lowestValue = Math.max(npcPrice, values.length > 0 ? Math.min(...values) : 0);

	return {
		name: item?.name ?? bz?.[itemId]?.name,
		ah: ahPrice,
		bazaar: bazaarPrice,
		npc: npcPrice,
		lowest: lowestValue,
	};
}
