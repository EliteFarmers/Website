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
import { getGemRarityName, getNextGemRarity, getPeridotFortune, getPeridotGemFortune } from '../util/gems.js';
import { nextRarity } from '../util/itemstats.js';
import { getUpgradeableEnchants } from './enchantupgrades.js';
import { getFakeItem } from './itemregistry.js';

export function getItemUpgrades(upgradeable: Upgradeable, options?: { stat?: Stat }): FortuneUpgrade[] {
	const { deadEnd, upgrade } = getSelfFortuneUpgrade(upgradeable) ?? {};
	if (deadEnd) return [upgrade] as FortuneUpgrade[];

	const upgrades = [] as (FortuneUpgrade | undefined)[];

	upgrades.push(upgrade);
	upgrades.push(getUpgradeableRarityUpgrade(upgradeable));
	upgrades.push(...getUpgradeableEnchants(upgradeable, options?.stat ?? Stat.FarmingFortune));
	upgrades.push(...getUpgradeableGems(upgradeable));
	upgrades.push(...getUpgradeableReforges(upgradeable, options?.stat ? [options.stat] : undefined));

	return upgrades.filter((u) => u) as FortuneUpgrade[];
}

export function getSelfFortuneUpgrade(
	upgradeable: Upgradeable
): { upgrade: FortuneUpgrade; deadEnd: boolean } | undefined {
	const nextItem = upgradeable.getItemUpgrade();
	const deadEnd = nextItem && nextItem.reason == UpgradeReason.DeadEnd;

	const { info: nextInfo, fake: nextFake } = getUpgradeableInfo(nextItem?.id);

	if (deadEnd && nextInfo) {
		const nextStats = nextFake?.getStats() ?? {};
		const currentStats = upgradeable.getStats();
		const deltaStats: Partial<Record<Stat, number>> = {};
		for (const stat of Object.values(Stat)) {
			const delta = (nextStats[stat] ?? 0) - (currentStats[stat] ?? 0);
			if (delta !== 0) deltaStats[stat] = delta;
		}
		return {
			deadEnd: true,
			upgrade: {
				title: nextInfo.name,
				increase: nextFake?.getFortune() ?? 0,
				stats: deltaStats,
				wiki: nextInfo.wiki,
				action: UpgradeAction.Purchase,
				purchase: nextInfo.skyblockId,
				category: UpgradeCategory.Item,
				cost: {
					...(nextItem.cost ?? {
						items: {
							[nextInfo.skyblockId]: 1,
						},
					}),
				},
				skillReq: nextInfo.skillReq,
				onto: {
					name: upgradeable.item.name,
					skyblockId: upgradeable.item.skyblockId,
					newSkyblockId: nextInfo.skyblockId,
				},
				meta: {
					type: 'buy_item',
					id: nextInfo.skyblockId,
				},
				conflictKey: `item_tier:${nextInfo.skyblockId}`,
			} satisfies FortuneUpgrade,
		};
	} else if (nextItem && nextInfo && !(nextItem.reason === UpgradeReason.Situational && !nextItem.preferred)) {
		// For item upgrades, compare base stats only (not total fortune which includes reforge/enchants)
		// This ensures the delta accurately represents what changes when upgrading the item itself
		const currentBaseStats = upgradeable.info.baseStats ?? {};
		const nextBaseStats = nextInfo.baseStats ?? {};

		const deltaStats: Partial<Record<Stat, number>> = {};
		for (const stat of Object.values(Stat)) {
			const delta = (nextBaseStats[stat] ?? 0) - (currentBaseStats[stat] ?? 0);
			if (delta !== 0) deltaStats[stat] = delta;
		}
		const increase = deltaStats[Stat.FarmingFortune] ?? 0;

		return {
			deadEnd: false,
			upgrade: {
				title: nextInfo.name,
				increase,
				stats: deltaStats,
				wiki: nextInfo.wiki,
				action: nextItem.reason === UpgradeReason.Situational ? UpgradeAction.Purchase : UpgradeAction.Upgrade,
				purchase: nextItem.reason === UpgradeReason.Situational ? nextItem.id : undefined,
				category: UpgradeCategory.Item,
				cost: {
					...(nextItem.cost ?? {
						items: {
							[nextItem.id]: 1,
						},
					}),
				},
				skillReq: nextInfo.skillReq,
				onto: {
					name: upgradeable.item.name,
					skyblockId: upgradeable.item.skyblockId,
					newSkyblockId: nextInfo.skyblockId,
				},
				meta: {
					type: 'buy_item',
					id: nextItem.id,
					itemUuid:
						nextItem.reason === UpgradeReason.Situational
							? undefined
							: (upgradeable.item.uuid ?? undefined),
				},
				conflictKey: `item_tier:${nextItem.id}`,
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

export function getUpgradeableInfo(skyblockId?: string): {
	info?: UpgradeableInfo;
	fake?: UpgradeableBase;
} {
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

	if (!item) return undefined;

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
		stats: {
			[Stat.FarmingFortune]: 0,
		},
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
		meta: {
			itemUuid: upgradeable.item.uuid ?? undefined,
			type: 'item',
			id: 'rarity_upgrades',
			value: 1,
		},
		conflictKey: 'recombobulate',
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

export function getUpgradeableReforges(upgradeable: Upgradeable, stats?: Stat[]): FortuneUpgrade[] {
	const primaryStat = stats?.[0] ?? Stat.FarmingFortune;
	const currentPrimary = upgradeable.reforgeStats?.stats?.[primaryStat] ?? 0;
	const currentStats = upgradeable.reforgeStats?.stats ?? {};
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
		// Only suggest reforges with an explicit reforge stone (keeps output consistent and costable)
		if (!reforge.stone?.id) continue;
		const tier = reforge.tiers[upgradeable.rarity];
		if (!tier || !tier.stats) continue;

		const nextPrimary = tier.stats?.[primaryStat] ?? 0;
		// Skip if the reforge doesn't improve the selected stat
		if (nextPrimary <= currentPrimary) continue;

		const deltaStats: Partial<Record<Stat, number>> = {};
		for (const stat of Object.values(Stat)) {
			const before = currentStats?.[stat] ?? 0;
			const after = tier.stats?.[stat] ?? 0;
			const diff = after - before;
			if (diff !== 0) deltaStats[stat] = diff;
		}
		const increase = deltaStats[Stat.FarmingFortune] ?? 0;

		result.push({
			title: 'Reforge to ' + reforge.name,
			increase,
			stats: deltaStats,
			action: UpgradeAction.Apply,
			category: UpgradeCategory.Reforge,
			conflictKey: 'reforge',
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
			meta: {
				type: 'reforge',
				id: reforge.name.toLowerCase().replaceAll(' ', '_'),
				itemUuid: upgradeable.item.uuid ?? undefined,
			},
		});
	}

	return result;
}

export function getUpgradeableGems(upgradeable: Upgradeable): FortuneUpgrade[] {
	const peridotSlots = upgradeable.info.gemSlots?.filter((s) => s.slot_type === 'PERIDOT');
	if (!peridotSlots || peridotSlots.length < 1) return [];

	const result = [] as FortuneUpgrade[];

	// Add entries for applying missing gems
	for (let i = 0; i < peridotSlots.length; i++) {
		const slot = peridotSlots[i];
		if (!slot) continue;
		if (!meetsGemSlotRequirements(upgradeable, slot)) continue;
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
					cost.coins = (cost.coins ?? 0) + (costItem.coins ?? 0);
				}
			}
		}

		result.push({
			title: 'Fine Peridot Gemstone',
			increase: getPeridotGemFortune(upgradeable.rarity, GemRarity.Fine),
			stats: {
				[Stat.FarmingFortune]: getPeridotGemFortune(upgradeable.rarity, GemRarity.Fine),
			},
			cost: cost,
			onto: {
				name: upgradeable.item.name,
				skyblockId: upgradeable.item.skyblockId,
			},
			action: UpgradeAction.Apply,
			category: UpgradeCategory.Gem,
			conflictKey: `gem:${slotId}:${GemRarity.Fine}`,
			meta: {
				type: 'gem',
				slot: slotId,
				value: GemRarity.Fine,
				itemUuid: upgradeable.item.uuid ?? undefined,
			},
		});
	}

	// Add entries for upgrading existing gems
	// unlockedSlots is array of GemRarity | null.
	// The previous loop handled "applying missing gems" which usually means slot unlocking AND gem placement?
	// Wait, getPeridotGems returns the rarities of gems in slots.
	// The previous loop checks `upgradeable.item?.gems?.[slotId] !== undefined`.
	// If gems are missing, it suggests "Fine Peridot".

	// The second loop iterates `unlockedSlots`.
	// But we need the SLOT ID for the second loop upgrades too.
	// getPeridotGems returns array of values, logic relies on index implicitly mapping to slots?
	// getPeridotGems implementation in `src/util/gems.ts` iterates slots PERIDOT_0, PERIDOT_1...
	// So `unlockedSlots[i]` corresponds to `PERIDOT_i`.

	// Add entries for upgrading existing gems
	const gems = upgradeable.item.gems ?? {};
	for (const [slotId, gem] of Object.entries(gems)) {
		if (!slotId.startsWith('PERIDOT')) continue;

		const gemRarity = gem as GemRarity | null;

		if (gemRarity === undefined) continue;
		if (gemRarity === GemRarity.Perfect) continue;

		// Start at Fine if the gem is null (not applied)
		// Flawed and Rough gems are not really worth applying
		const nextGem = gemRarity === null ? GemRarity.Fine : getNextGemRarity(gemRarity);
		const currentFortune = getPeridotGemFortune(upgradeable.rarity, gemRarity);
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
				stats: {
					[Stat.FarmingFortune]: nextFortune - currentFortune,
				},
				action: UpgradeAction.Apply,
				category: UpgradeCategory.Gem,
				conflictKey: `gem:${slotId}:${nextGem}`,
				meta: {
					type: 'gem',
					slot: slotId,
					value: nextGem,
					itemUuid: upgradeable.item.uuid ?? undefined,
				},
			});
		}
	}

	return result;
}

function meetsGemSlotRequirements(
	upgradeable: Upgradeable,
	slot: Exclude<UpgradeableInfo['gemSlots'], undefined>[number] | undefined
): boolean {
	if (!slot) return true;
	const requirements = slot.requirements;
	if (!requirements || requirements.length === 0) return true;

	for (const req of requirements) {
		if (req.type !== 'ITEM_DATA') continue;

		const key = req.data_key;
		const raw = upgradeable.item.attributes?.[key];
		const current = toNumberOrDefault(raw, key === 'levelable_lvl' ? 1 : 0);
		const target = toNumberOrDefault(req.value, 0);

		switch (req.operator) {
			case 'GREATER_THAN_OR_EQUALS':
				if (!(current >= target)) return false;
				break;
			case 'GREATER_THAN':
				if (!(current > target)) return false;
				break;
			case 'EQUALS':
				if (!(current === target)) return false;
				break;
			case 'LESS_THAN_OR_EQUALS':
				if (!(current <= target)) return false;
				break;
			case 'LESS_THAN':
				if (!(current < target)) return false;
				break;
			default:
				// Unknown operator: don't block suggestions.
				break;
		}
	}

	return true;
}

function toNumberOrDefault(value: unknown, defaultValue: number): number {
	const n = typeof value === 'number' ? value : typeof value === 'string' ? +value : NaN;
	return Number.isFinite(n) ? n : defaultValue;
}
