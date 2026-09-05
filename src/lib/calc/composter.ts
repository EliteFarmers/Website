import type { RatesItemPriceData } from '$lib/api/elite';
import {
	COMPOSTER_FUELS,
	COMPOSTER_ORGANIC_MATTER_ITEMS,
	type ComposterPriceMap,
	type RankedComposterMaterial,
} from 'farming-weight';

export type ComposterPurchaseMode = 'instabuy' | 'buyorder';
export type ComposterSellMode = 'instasell' | 'sellorder';

export const COMPOST_ITEM_ID = 'COMPOST';
export const COMPOSTER_PRICE_ITEM_IDS = [
	...new Set([
		...COMPOSTER_ORGANIC_MATTER_ITEMS.map((item) => item.itemId),
		...COMPOSTER_FUELS.map((item) => item.itemId),
		COMPOST_ITEM_ID,
	]),
];

export function getComposterPurchasePrice(
	item: RatesItemPriceData[string] | undefined,
	mode: ComposterPurchaseMode
): number | undefined {
	const bazaar = item?.bazaar;
	const bazaarPrice =
		mode === 'instabuy'
			? firstPositive(bazaar?.averageBuy, bazaar?.buy)
			: firstPositive(bazaar?.averageBuyOrder, bazaar?.buyOrder);
	if (bazaarPrice !== undefined) return bazaarPrice;

	const auction = item?.auctions?.find((entry) => entry.variantKey === '') ?? item?.auctions?.[0];
	return firstPositive(auction?.lowest, auction?.rawLowest, auction?.last);
}

export function getComposterPriceMap(items: RatesItemPriceData, mode: ComposterPurchaseMode): ComposterPriceMap {
	return Object.fromEntries(
		Object.entries(items).flatMap(([itemId, item]) => {
			const price = getComposterPurchasePrice(item, mode);
			return price === undefined ? [] : [[itemId, price]];
		})
	);
}

export function getCompostSellPrice(items: RatesItemPriceData, mode: ComposterSellMode): number | undefined {
	const bazaar = items[COMPOST_ITEM_ID]?.bazaar;
	return mode === 'instasell'
		? firstPositive(bazaar?.averageSell, bazaar?.sell)
		: firstPositive(bazaar?.averageSellOrder, bazaar?.sellOrder);
}

export function getCheapestUsableMaterial(
	materials: readonly RankedComposterMaterial[]
): RankedComposterMaterial | undefined {
	return materials.find((material) => material.fitsCapacity);
}

function firstPositive(...values: Array<number | null | undefined>): number | undefined {
	return values.find((value): value is number => Number.isFinite(value) && value! > 0);
}
