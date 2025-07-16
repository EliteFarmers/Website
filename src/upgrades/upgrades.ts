import { REFORGES } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import {
	type FortuneUpgrade,
	type FortuneUpgradeImprovement,
	type Upgrade,
	UpgradeAction,
	UpgradeCategory,
	type UpgradeCost,
	UpgradeReason,
} from '../constants/upgrades.js';
import { GemRarity } from '../fortune/item.js';
import type { Upgradeable, UpgradeableInfo } from '../fortune/upgradeable.js';
import type { UpgradeableBase } from '../fortune/upgradeablebase.js';
import { FARMING_TOOLS, type FarmingToolInfo } from '../items/tools.js';
import {
	getGemRarityName,
	getNextGemRarity,
	getPeridotFortune,
	getPeridotGemFortune,
	getPeridotGems,
} from '../util/gems.js';
import { nextRarity } from '../util/itemstats.js';
import { getUpgradeableEnchants } from './enchantupgrades.js';
import { getFakeItem } from './itemregistry.js';

export function getItemUpgrades(upgradeable: Upgradeable): FortuneUpgrade[] {
	const { deadEnd, upgrade } = getSelfFortuneUpgrade(upgradeable) ?? {};
	if (deadEnd) return [upgrade] as FortuneUpgrade[];

	const upgrades = [] as (FortuneUpgrade | undefined)[];

	upgrades.push(upgrade);
	upgrades.push(getUpgradeableRarityUpgrade(upgradeable));
	upgrades.push(...getUpgradeableEnchants(upgradeable));
	upgrades.push(...getUpgradeableGems(upgradeable));
	upgrades.push(...getUpgradeableReforges(upgradeable));

	return upgrades.filter((u) => u) as FortuneUpgrade[];
}

export function getSelfFortuneUpgrade(
	upgradeable: Upgradeable
): { upgrade: FortuneUpgrade; deadEnd: boolean } | undefined {
	const nextItem = upgradeable.getItemUpgrade();
	const deadEnd = nextItem && nextItem.reason == UpgradeReason.DeadEnd;

	const { info: nextInfo, fake: nextFake } = getUpgradeableInfo(nextItem?.id);

	if (deadEnd && nextInfo) {
		return {
			deadEnd: true,
			upgrade: {
				title: nextInfo.name,
				increase: nextFake?.getFortune() ?? 0,
				wiki: nextInfo.wiki,
				action: UpgradeAction.Purchase,
				purchase: nextInfo.skyblockId,
				category: UpgradeCategory.Item,
				cost: nextItem.cost ?? {
					items: {
						[nextInfo.skyblockId]: 1,
					},
				},
				onto: {
					name: upgradeable.item.name,
					skyblockId: upgradeable.item.skyblockId,
				},
			} satisfies FortuneUpgrade,
		};
	} else if (nextItem && nextInfo && !(nextItem.reason === UpgradeReason.Situational && !nextItem.preferred)) {
		const increase = (nextFake?.getFortune() ?? 0) - upgradeable.fortune;
		return {
			deadEnd: false,
			upgrade: {
				title: nextInfo.name,
				increase: increase < 0 ? 0 : increase,
				wiki: nextInfo.wiki,
				action: nextItem.reason === UpgradeReason.Situational ? UpgradeAction.Purchase : UpgradeAction.Upgrade,
				purchase: nextItem.reason === UpgradeReason.Situational ? nextItem.id : undefined,
				category: UpgradeCategory.Item,
				cost: nextItem.cost ?? {
					items: {
						[nextItem.id]: 1,
					},
				},
				onto: {
					name: upgradeable.item.name,
					skyblockId: upgradeable.item.skyblockId,
				},
			} satisfies FortuneUpgrade,
		};
	}
}

export function getLastToolUpgrade(tool: FarmingToolInfo): UpgradeableInfo | undefined {
	const upgrade = tool.upgrade;
	if (!upgrade) return undefined;

	let last = upgrade;
	let item = FARMING_TOOLS[upgrade.id];
	if (!item) return undefined;

	while (item?.upgrade && (item.upgrade.reason !== UpgradeReason.Situational || item.upgrade.preferred)) {
		last = item.upgrade;
		item = FARMING_TOOLS[item.upgrade.id];
	}

	if (!item || last === upgrade) return undefined;

	return item;
}

export function getUpgradeableInfo(skyblockId?: string): { info?: UpgradeableInfo; fake?: UpgradeableBase } {
	if (!skyblockId) return { info: undefined, fake: undefined };

	const fake = getFakeItem(skyblockId);

	if (fake) {
		return {
			info: fake.info,
			fake: fake,
		};
	}

	return { info: undefined, fake: undefined };
}

export function getNextItemUpgradeableTo(
	upgradeable: Upgradeable,
	options: Partial<Record<string, UpgradeableInfo>>
): { upgrade: Upgrade; info: UpgradeableInfo } | undefined {
	const upgrade = upgradeable.getItemUpgrade();
	if (!upgrade) return undefined;

	const next = options[upgrade.id];
	if (!next) return undefined;

	return { upgrade: upgrade, info: next };
}

export function getLastItemUpgradeableTo(
	upgradeable: Upgradeable,
	options: Partial<Record<string, UpgradeableInfo>>
): { upgrade: Upgrade; info: UpgradeableInfo } | undefined {
	const upgrade = upgradeable.getItemUpgrade();
	if (!upgrade || (upgrade.reason === UpgradeReason.Situational && !upgrade.preferred)) return undefined;

	let last = upgrade;
	let item = options[upgrade.id];
	if (!item) return undefined;

	while (item?.upgrade && (item.upgrade.reason !== UpgradeReason.Situational || item.upgrade.preferred)) {
		last = item.upgrade;
		item = options[item.upgrade.id];
	}

	if (!item || last === upgrade) return undefined;

	return { upgrade: last, info: item };
}

export function getUpgradeableRarityUpgrade(upgradeable: Upgradeable): FortuneUpgrade | undefined {
	// Skip if the item is already recombobulated
	if (upgradeable.recombobulated) return;

	const rarity = upgradeable.rarity;
	const next = nextRarity(upgradeable.rarity);

	const result = {
		title: 'Recombobulate ' + upgradeable.item.name,
		increase: 0,
		action: UpgradeAction.Recombobulate,
		category: UpgradeCategory.Rarity,
		improvements: [] as FortuneUpgradeImprovement[],
		cost: {
			items: {
				RECOMBOBULATOR_3000: 1,
			},
		},
		onto: {
			name: upgradeable.item.name,
			skyblockId: upgradeable.item.skyblockId,
		},
	} satisfies FortuneUpgrade;

	// Gemstone fortune increases with rarity
	// Calculate the difference in fortune between the current and next rarity

	const currentPeridot = getPeridotFortune(upgradeable.rarity, upgradeable.item);
	const nextPeridot = getPeridotFortune(next, upgradeable.item);

	if (nextPeridot > currentPeridot) {
		result.increase += nextPeridot - currentPeridot;
		result.improvements.push({
			name: 'Peridot Gems Rarity Increase',
			fortune: nextPeridot - currentPeridot,
		});
	}

	// Reforge fortune increases with rarity
	// Calculate the difference in fortune between the current and next rarity
	if (!upgradeable.reforge) {
		if (result.increase <= 0) return undefined;
		return result;
	}

	const reforgeTiers = upgradeable.reforge.tiers;
	const currentFortune = reforgeTiers?.[rarity]?.stats?.[Stat.FarmingFortune] ?? 0;
	const nextFortune = reforgeTiers?.[next]?.stats?.[Stat.FarmingFortune] ?? 0;

	if (nextFortune > currentFortune) {
		result.increase += nextFortune - currentFortune;
		result.improvements.push({
			name: 'Reforge Rarity Increase',
			fortune: nextFortune - currentFortune,
		});
	}

	if (result.increase <= 0) return undefined;

	return result;
}

export function getUpgradeableReforges(upgradeable: Upgradeable): FortuneUpgrade[] {
	const currentFortune = upgradeable.reforgeStats?.stats?.[Stat.FarmingFortune] ?? 0;
	const result: FortuneUpgrade[] = [];

	for (const reforge of Object.values(REFORGES)) {
		// Skip if the reforge doesn't apply to the item or is currently applied
		if (
			!upgradeable.type ||
			!reforge ||
			!reforge.appliesTo.includes(upgradeable.type) ||
			reforge === upgradeable.reforge
		) {
			continue;
		}
		const tier = reforge.tiers[upgradeable.rarity];
		if (!tier || !tier.stats?.[Stat.FarmingFortune]) continue;

		const reforgeFortune = tier.stats[Stat.FarmingFortune];
		// Skip if the reforge doesn't increase farming fortune
		if (reforgeFortune <= currentFortune) continue;

		result.push({
			title: 'Reforge to ' + reforge.name,
			increase: reforgeFortune - currentFortune,
			action: UpgradeAction.Apply,
			category: UpgradeCategory.Reforge,
			wiki: reforge.wiki,
			onto: {
				name: upgradeable.item.name,
				skyblockId: upgradeable.item.skyblockId,
			},
			cost: reforge.stone?.id
				? {
						items: {
							[reforge.stone.id]: 1,
						},
						applyCost: tier.cost
							? {
									coins: tier.cost,
								}
							: undefined,
					}
				: undefined,
		});
	}

	return result;
}

export function getUpgradeableGems(upgradeable: Upgradeable): FortuneUpgrade[] {
	const peridotSlots = upgradeable.info.gemSlots?.filter((s) => s.slot_type === 'PERIDOT');
	if (!peridotSlots || peridotSlots.length < 1) return [];

	const unlockedSlots = getPeridotGems(upgradeable.item);

	const result = [] as FortuneUpgrade[];

	// Add entries for applying missing gems
	for (let i = 0; i < peridotSlots.length; i++) {
		const slot = peridotSlots[i];
		if (!slot) continue;
		const slotId = slot.slot_type + '_' + i;

		// Check that the slot is not unlocked
		if (upgradeable.item?.gems?.[slotId] !== undefined) continue;

		// Intentionally skipping Rough and Flawed gems as they are not really worth applying
		// A way to configure this would be nice at some point

		const cost = {
			items: {
				FINE_PERIDOT_GEM: 1,
			},
		} as UpgradeCost;

		if (slot.costs) {
			for (const costItem of slot.costs) {
				if (costItem.type === 'ITEM') {
					cost.items ??= {};
					cost.items[costItem.item_id] = costItem.amount + (cost.items[costItem.item_id] ?? 0);
				} else if (costItem.type === 'COINS') {
					cost.coins = costItem.coins;
				}
			}
		}

		result.push({
			title: 'Fine Peridot Gemstone',
			increase: getPeridotGemFortune(upgradeable.rarity, GemRarity.Fine),
			cost: cost,
			onto: {
				name: upgradeable.item.name,
				skyblockId: upgradeable.item.skyblockId,
			},
			action: UpgradeAction.Apply,
			category: UpgradeCategory.Gem,
		});
	}

	// Add entries for upgrading existing gems
	for (const gem of unlockedSlots) {
		if (gem === GemRarity.Perfect) continue;

		// Start at Fine if the gem is null (not applied)
		// Flawed and Rough gems are not really worth applying
		const nextGem = gem === null ? GemRarity.Fine : getNextGemRarity(gem);
		const currentFortune = getPeridotGemFortune(upgradeable.rarity, gem);
		const nextFortune = getPeridotGemFortune(upgradeable.rarity, nextGem);

		if (nextFortune > currentFortune) {
			result.push({
				title: getGemRarityName(nextGem) + ' Peridot Gemstone',
				cost: {
					items: {
						[`${getGemRarityName(nextGem).toUpperCase()}_PERIDOT_GEM`]: 1,
					},
				},
				onto: {
					name: upgradeable.item.name,
					skyblockId: upgradeable.item.skyblockId,
				},
				increase: nextFortune - currentFortune,
				action: UpgradeAction.Apply,
				category: UpgradeCategory.Gem,
			});
		}
	}

	return result;
}
