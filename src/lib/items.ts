import type { FortuneUpgrade, UpgradeCost, UpgradeInfo } from 'farming-weight';
import type { RatesItemPriceData } from './api/elite';

export function getItemsFromUpgrades(upgrades: (FortuneUpgrade | UpgradeInfo)[]) {
	return [
		...new Set(
			upgrades
				.map((up) => [
					Object.keys(up.cost?.items ?? {}),
					Object.keys(up.cost?.applyCost?.items ?? {}),
					up.purchase,
				])
				.flat(2)
				.filter(Boolean)
				.flat() as string[]
		),
	];
}

export function getItemsFromCosts(costs: UpgradeCost[]) {
	return [
		...new Set(
			costs
				.map((cost) => [Object.keys(cost?.items ?? {}), Object.keys(cost?.applyCost?.items ?? {})])
				.flat(2)
				.filter(Boolean)
				.flat() as string[]
		),
	];
}

export function getUpgradeCost(upgrade: FortuneUpgrade | UpgradeInfo | UpgradeCost, items?: RatesItemPriceData) {
	return getUpgradeCostBreakdown(upgrade, items).total;
}

export function getUpgradeCostBreakdown(
	upgrade: FortuneUpgrade | UpgradeInfo | UpgradeCost,
	items?: RatesItemPriceData
) {
	let total = 0;
	let cost: UpgradeCost | undefined;
	const breakdown: Record<string, { count: number; cost: number }> = {};

	if ('cost' in upgrade) {
		cost = upgrade.cost;
	} else {
		cost = upgrade as UpgradeCost;
	}

	if (!cost) return { total, breakdown };

	if (cost) {
		sumItems(cost.items);
		total += cost.coins ?? 0;

		if (cost.copper) {
			breakdown['Copper'] = { count: cost.copper, cost: -1 };
		}
	}
	if (cost?.applyCost) {
		sumItems(cost.applyCost.items);
		total += cost.applyCost.coins ?? 0;
	}

	return { total, breakdown };

	function sumItems(requiredItems?: Record<string, number>) {
		for (const [item, amount] of Object.entries(requiredItems ?? {})) {
			const itemCost = items?.[item];
			if (!itemCost) continue;
			const lowestPrice = itemCost.auctions?.length
				? Math.min(...itemCost.auctions.filter((a) => a.lowest3Day > 0).map((a) => a.lowest3Day))
				: (itemCost.bazaar?.averageBuyOrder ?? 0);

			total += lowestPrice * amount;

			const name = itemCost.item?.name ?? item;
			breakdown[name] ??= { count: 0, cost: 0 };
			breakdown[name].count += amount;
			breakdown[name].cost += lowestPrice * amount;
		}
	}
}
