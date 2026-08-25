import type { UpgradeRateImpact } from '../player/player.js';

export type ItemSellValueResolver = (itemId: string) => number;

export function getRateImpactCoinValue(
	impact: UpgradeRateImpact<unknown, unknown> | undefined,
	getItemSellValue: ItemSellValueResolver,
	primaryItemId?: string
): number {
	if (!impact) return 0;
	if (impact.valuationDelta?.coinsPerHour !== undefined) return impact.valuationDelta.coinsPerHour;

	let total = impact.delta.npcCoins;
	if (primaryItemId) total += getItemSellValue(primaryItemId) * impact.delta.collection;
	for (const [itemId, amount] of Object.entries(impact.delta.items ?? {})) {
		total += getItemSellValue(itemId) * amount;
	}
	for (const [itemId, amount] of Object.entries(impact.delta.rngItems ?? {})) {
		total += getItemSellValue(itemId) * amount;
	}
	return total;
}
