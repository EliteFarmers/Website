import type { RatesItemPriceData } from '$lib/api/elite';
import { getPossibleResultsFromCrops, type Crop, type DetailedDropsFromEffectsResult } from 'farming-weight';

type CropDrops = Pick<DetailedDropsFromEffectsResult, 'items' | 'rngItems' | 'collection' | 'npcCoins' | 'npcPrice'>;

function getSellPrice(bazaar: RatesItemPriceData[string]['bazaar'], mode: 'insta' | 'order') {
	const price = mode === 'insta' ? bazaar?.averageSell : bazaar?.averageSellOrder;
	return price !== undefined && Number.isFinite(price) && price > 0 ? price : 0;
}

export function calculateCropBazaarProfit(
	result: CropDrops,
	crop: Crop,
	prices: RatesItemPriceData | undefined,
	mode: 'insta' | 'order'
) {
	const amount = result.items[crop] ?? result.collection;
	let otherCoinsNpc = result.npcCoins - amount * result.npcPrice;
	const otherItems = new Map<string, number>();
	for (const [itemId, count] of Object.entries(result.items)) {
		if (itemId !== crop && count > 0) otherItems.set(itemId, count);
	}
	for (const [itemId, count] of Object.entries(result.rngItems ?? {})) {
		if (count <= 0) continue;
		// RNG drops are separate from items and are not included in npcCoins.
		otherCoinsNpc += count * (prices?.[itemId]?.bazaar?.npc ?? 0);
		otherItems.set(itemId, (otherItems.get(itemId) ?? 0) + count);
	}

	const sellToBazaar = [...otherItems]
		.flatMap(([itemId, items]) => {
			const data = prices?.[itemId];
			const npc = data?.bazaar?.npc ?? 0;
			const per = getSellPrice(data?.bazaar, mode);
			if (per <= npc) return [];
			return [
				{
					itemId,
					name: data?.bazaar?.name ?? data?.item?.name ?? itemId,
					items,
					npc,
					per,
					gain: items * (per - npc),
				},
			];
		})
		.sort((a, b) => b.gain - a.gain);
	const otherCoinsTotal = otherCoinsNpc + sellToBazaar.reduce((sum, item) => sum + item.gain, 0);
	const sellToBazaarCoins = sellToBazaar.reduce((sum, item) => sum + item.items * item.per, 0);

	const bzOptions = Object.entries(getPossibleResultsFromCrops(crop, amount))
		.flatMap(([itemId, craft]) => {
			if (itemId === crop) return [];
			const data = prices?.[itemId];
			const per = getSellPrice(data?.bazaar, mode);
			if (per <= 0) return [];
			const profit = craft.fractionalItems * per - craft.fractionalCost;
			return [
				{
					name: data?.bazaar?.name ?? data?.item?.name ?? itemId,
					items: craft.fractionalItems,
					cost: craft.fractionalCost,
					per,
					profit: Math.floor(profit),
					total: Math.floor(profit + otherCoinsTotal),
				},
			];
		})
		.sort((a, b) => b.total - a.total);

	return {
		bazaarProfit: bzOptions[0]?.total ?? null,
		bzOptions,
		sellToBazaar,
		otherCoinsTotal: Math.floor(otherCoinsTotal),
		otherCoinsNpcRemaining: Math.floor(Math.max(0, otherCoinsTotal - sellToBazaarCoins)),
		sellToBazaarCoins: Math.floor(sellToBazaarCoins),
	};
}
