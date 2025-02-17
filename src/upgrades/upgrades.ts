import { EnchantTierProcurement, FARMING_ENCHANTS } from '../constants/enchants.js';
import { Stat } from '../constants/stats.js';
import {
	FortuneSource,
	FortuneSourceProgress,
	FortuneUpgrade,
	FortuneUpgradeImprovement,
	Upgrade,
	UpgradeAction,
	UpgradeCategory,
	UpgradeReason,
} from '../constants/upgrades.js';
import { GemRarity } from '../fortune/item.js';
import { Upgradeable, UpgradeableInfo } from '../fortune/upgradeable.js';
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
	return [
		getUpgradeableRarityUpgrade(upgradeable),
		...getUpgradeableEnchants(upgradeable),
		...getUpgradeableGems(upgradeable),
	].filter((u) => u) as FortuneUpgrade[];
}

export function getLastToolUpgrade(tool: FarmingToolInfo): UpgradeableInfo | undefined {
	const upgrade = tool.upgrade;
	if (!upgrade) return undefined;

	let last = upgrade;
	let item = FARMING_TOOLS[upgrade.id];
	if (!item) return undefined;

	while (item?.upgrade && (item.upgrade.reason !== UpgradeReason.Situational || item.upgrade.preffered)) {
		last = item.upgrade;
		item = FARMING_TOOLS[item.upgrade.id];
	}

	if (!item || last === upgrade) return undefined;

	return item;
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
	if (!upgrade || (upgrade.reason === UpgradeReason.Situational && !upgrade.preffered)) return undefined;

	let last = upgrade;
	let item = options[upgrade.id];
	if (!item) return undefined;

	while (item?.upgrade && (item.upgrade.reason !== UpgradeReason.Situational || item.upgrade.preffered)) {
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
		title: 'Recombobulator',
		increase: 0,
		action: UpgradeAction.Recombobulate,
		category: UpgradeCategory.Rarity,
		improvements: [] as FortuneUpgradeImprovement[],
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

	return result;
}

export function getUpgradeableEnchants(upgradeable: Upgradeable): FortuneUpgrade[] {
	if (!upgradeable.type) return [];

	const result = [] as FortuneUpgrade[];

	for (const enchantId in FARMING_ENCHANTS) {
		const enchant = FARMING_ENCHANTS[enchantId];

		// Skip if the enchantment doesn't apply to the item
		if (!enchant || !enchant.appliesTo.includes(upgradeable.type)) continue;
		// Skip if the enchantment is crop specific and the crop doesn't match
		if (upgradeable.crop && enchant.cropSpecific !== upgradeable.crop) continue;

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
			});

			continue;
		}

		// If the enchantment is at max level already, skip it
		if (applied >= enchant.maxLevel) continue;

		// Add an entry for upgrading the enchantment
		const currentFortune = getFortuneFromEnchant(applied, enchant, upgradeable.options, upgradeable.crop);
		const nextFortune = getFortuneFromEnchant(applied + 1, enchant, upgradeable.options, upgradeable.crop);

		result.push({
			title: enchant.name + ' ' + (applied + 1),
			increase: nextFortune - currentFortune,
			action: UpgradeAction.Apply,
			category: UpgradeCategory.Enchant,
		});
	}

	return result;
}

export function getUpgradeableGems(upgradeable: Upgradeable): FortuneUpgrade[] {
	const peridotSlots = upgradeable.info.gemSlots?.peridot;
	if (!peridotSlots) return [];

	const applied = getPeridotGems(upgradeable.item);

	const result = [] as FortuneUpgrade[];

	// Add entries for applying missing gems
	for (let i = applied.length; i < peridotSlots; i++) {
		// Intentionally skipping Rough and Flawed gems as they are not really worth applying
		// A way to configure this would be nice at some point
		result.push({
			title: 'Fine Peridot Gemstone',
			increase: getPeridotGemFortune(upgradeable.rarity, GemRarity.Fine),
			action: UpgradeAction.Apply,
			category: UpgradeCategory.Gem,
		});
	}

	// Add entries for upgrading existing gems
	for (const gem of applied) {
		if (gem === GemRarity.Perfect) continue;

		const nextGem = getNextGemRarity(gem);
		const currentFortune = getPeridotGemFortune(upgradeable.rarity, gem);
		const nextFortune = getPeridotGemFortune(upgradeable.rarity, nextGem);

		if (nextFortune > currentFortune) {
			result.push({
				title: getGemRarityName(nextGem) + ' Peridot Gemstone',
				increase: nextFortune - currentFortune,
				action: UpgradeAction.Apply,
				category: UpgradeCategory.Gem,
			});
		}
	}

	return result;
}
