import { EnchantTierProcurement, FARMING_ENCHANTS, FarmingEnchant } from '../constants/enchants.js';
import { REFORGES, Rarity } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import {
	FortuneSource,
	FortuneSourceProgress,
	FortuneUpgrade,
	FortuneUpgradeImprovement,
	Upgrade,
	UpgradeAction,
	UpgradeCategory,
	UpgradeCost,
	UpgradeReason,
} from '../constants/upgrades.js';
import { FarmingAccessory } from '../fortune/farmingaccessory.js';
import { FarmingArmor } from '../fortune/farmingarmor.js';
import { FarmingEquipment } from '../fortune/farmingequipment.js';
import { FarmingTool } from '../fortune/farmingtool.js';
import { GemRarity } from '../fortune/item.js';
import { Upgradeable, UpgradeableBase, UpgradeableInfo } from '../fortune/upgradeable.js';
import { FARMING_ACCESSORIES_INFO, FarmingAccessoryInfo } from '../items/accessories.js';
import { FARMING_ARMOR_INFO, FarmingArmorInfo } from '../items/armor.js';
import { FARMING_EQUIPMENT_INFO } from '../items/equipment.js';
import { FARMING_TOOLS, FarmingToolInfo } from '../items/tools.js';
import { getFortuneFromEnchant } from '../util/enchants.js';
import {
	getGemRarityName,
	getNextGemRarity,
	getPeridotFortune,
	getPeridotGemFortune,
	getPeridotGems,
} from '../util/gems.js';
import { nextRarity } from '../util/itemstats.js';
import { DynamicFortuneSource } from './sources/toolsources.js';

export function getFortune(level: number | null | undefined, source: FortuneSource) {
	return Math.min(Math.max(level ?? 0, 0), source.maxLevel) * source.fortunePerLevel;
}

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
	const notFound = { info: undefined, fake: undefined } as const;
	if (!skyblockId) return notFound;
	if (FARMING_TOOLS[skyblockId]) {
		const info = FARMING_TOOLS[skyblockId];
		return { info, fake: FarmingTool.fakeItem(info as FarmingToolInfo) };
	}
	if (FARMING_ACCESSORIES_INFO[skyblockId]) {
		const info = FARMING_ACCESSORIES_INFO[skyblockId];
		return { info, fake: FarmingAccessory.fakeItem(info as FarmingAccessoryInfo) };
	}
	if (FARMING_ARMOR_INFO[skyblockId]) {
		const info = FARMING_ARMOR_INFO[skyblockId];
		return { info, fake: FarmingArmor.fakeItem(info as FarmingArmorInfo) };
	}
	if (FARMING_EQUIPMENT_INFO[skyblockId]) {
		const info = FARMING_EQUIPMENT_INFO[skyblockId];
		return { info, fake: FarmingEquipment.fakeItem(info as FarmingArmorInfo) };
	}
	return notFound;
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

export function getSourceProgress<T extends object>(
	upgradeable: T,
	sources: DynamicFortuneSource<T>[],
	zeroed = false
): FortuneSourceProgress[] {
	const result = [] as FortuneSourceProgress[];

	// Ensure the item fortune is up to date
	if ('getFortune' in upgradeable && typeof upgradeable.getFortune === 'function') {
		upgradeable.getFortune();
	}

	for (const source of sources) {
		if (!source.exists(upgradeable)) continue;

		const max = source.max(upgradeable);
		const current = zeroed ? 0 : source.current(upgradeable);

		const progress = {
			name: source.name,
			fortune: current,
			maxFortune: max,
			ratio: Math.min(current / max, 1),
		} as FortuneSourceProgress;

		if (source.progress) {
			const p = source.progress(upgradeable);
			if (p) {
				progress.progress = p;
			}
		}

		if (source.info) {
			const { item, info, maxInfo, nextInfo } = source.info(upgradeable);
			if (item) progress.item = item;
			if (info) progress.info = info;
			if (maxInfo) progress.maxInfo = maxInfo;
			if (nextInfo) progress.nextInfo = nextInfo;
		}

		if (source.wiki) {
			const wiki = source.wiki(upgradeable);
			if (wiki) progress.wiki = wiki;
		}

		if (source.api === false) {
			progress.api = false;
		}

		if (source.upgrades) {
			const upgrades = source.upgrades(upgradeable);
			for (const upgrade of upgrades) {
				upgrade.max = upgrade.max ?? max;
				upgrade.wiki = upgrade.wiki ?? progress.wiki;
			}
			if (upgrades.length > 0) {
				progress.upgrades = upgrades;
			}
		}

		result.push(progress);
	}

	return result;
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

export function getUpgradeableEnchants(upgradeable: Upgradeable): FortuneUpgrade[] {
	if (!upgradeable.type) return [];

	const result = [] as FortuneUpgrade[];

	for (const enchantId in FARMING_ENCHANTS) {
		result.push(...getUpgradeableEnchant(upgradeable, enchantId));
	}

	return result;
}

export function getUpgradeableEnchant(upgradeable: Upgradeable, enchantId: string): FortuneUpgrade[] {
	const enchant = FARMING_ENCHANTS[enchantId];
	if (!upgradeable.type || !enchant) return [];

	const result = [] as FortuneUpgrade[];

	// Skip if the enchantment doesn't apply to the item
	if (!enchant || !enchant.appliesTo.includes(upgradeable.type)) return result;
	// Skip if the enchantment is crop specific and the crop doesn't match
	if (enchant.cropSpecific && enchant.cropSpecific !== upgradeable.crop) return result;

	const applied = upgradeable.item.enchantments?.[enchantId];

	// If the enchantment is not applied, add an entry for applying it
	if (!applied) {
		const procurement = enchant.levels[enchant.minLevel]?.procurement;

		result.push({
			title: enchant.name + ' 1',
			increase: getFortuneFromEnchant(enchant.minLevel, enchant, upgradeable.options, upgradeable.crop),
			wiki: enchant.wiki,
			action:
				!procurement || procurement === EnchantTierProcurement.Normal
					? UpgradeAction.Apply
					: UpgradeAction.LevelUp,
			category: UpgradeCategory.Enchant,
			cost: {
				items: {
					[enchantNameToId(enchant) + '_1']: 1,
				},
			},
			onto: {
				name: upgradeable.item.name,
				skyblockId: upgradeable.item.skyblockId,
			},
		});

		return result;
	}

	// If the enchantment is at max level already, we don't need to do anything
	if (applied >= enchant.maxLevel) return result;

	// Add an entry for upgrading the enchantment
	const currentFortune = getFortuneFromEnchant(applied, enchant, upgradeable.options, upgradeable.crop);
	const nextFortune = getFortuneFromEnchant(applied + 1, enchant, upgradeable.options, upgradeable.crop);

	const nextEnchant = enchant.levels[applied + 1];
	if (!nextEnchant) return result;

	const normalNext =
		!nextEnchant.procurement ||
		nextEnchant.procurement === EnchantTierProcurement.Normal ||
		nextEnchant.procurement === EnchantTierProcurement.Loot;
	const items = nextEnchant.cost?.items ?? ({} as Record<string, number>);

	switch (nextEnchant.procurement) {
		case undefined:
		case EnchantTierProcurement.Normal: {
			// Get amount of level 1 enchantment items needed to craft the same applied level
			// Ex: 4 level 1 items = 2 level 2 items = 1 level 3 item
			// Count = Math.pow(2, applied - 1)
			const count = Math.pow(2, applied - 1);
			items[enchantNameToId(enchant) + '_1'] = count;
			break;
		}
		case EnchantTierProcurement.Loot:
			// The desired level needs to be applied directly
			items[enchantNameToId(enchant) + '_' + (applied + 1)] = 1;
			break;
		case EnchantTierProcurement.SelfLeveling:
			return result; // Self-leveling enchantments do not have a cost
		default:
			break;
	}

	const cost = {
		...(nextEnchant.cost ?? {}),
		items: Object.keys(items).length > 0 ? items : undefined,
	};

	result.push({
		title: enchant.name + ' ' + (applied + 1),
		increase: nextFortune - currentFortune,
		action: normalNext ? UpgradeAction.Apply : UpgradeAction.LevelUp,
		category: UpgradeCategory.Enchant,
		cost: cost,
		wiki: enchant.wiki,
		onto: {
			name: upgradeable.item.name,
			skyblockId: upgradeable.item.skyblockId,
		},
	});

	return result;
}

function enchantNameToId(enchant: FarmingEnchant): string {
	if (enchant.id) return enchant.id;
	return 'ENCHANTMENT_' + enchant.name.toLocaleUpperCase().replaceAll(' ', '_').replaceAll('-', '_');
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
