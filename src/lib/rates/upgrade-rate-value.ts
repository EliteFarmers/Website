import type { RatesItemPriceData } from '$lib/api/elite';
import { getRateImpactCoinValue as getPackageRateImpactCoinValue, type UpgradeRateImpact } from 'farming-weight';
import { getBestItemSellPrice } from './item-sell-price';

export function getRateImpactCoinValue(
	impact: UpgradeRateImpact<unknown, unknown> | undefined,
	itemsLookup?: RatesItemPriceData,
	primaryItemId?: string
): number {
	return getPackageRateImpactCoinValue(impact, (itemId) => getItemSellValue(itemId, itemsLookup), primaryItemId);
}

function getItemSellValue(itemId: string, itemsLookup?: RatesItemPriceData): number {
	return getBestItemSellPrice(itemsLookup?.[itemId])?.coins ?? 0;
}
