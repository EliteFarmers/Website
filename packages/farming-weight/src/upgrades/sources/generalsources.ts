import {
	FARMING_ATTRIBUTE_SHARDS,
	getShardFortune,
	getShardLevel,
	getShardStat,
	getShardsForLevel,
	getShardsForNextLevel,
} from '../../constants/attributes.js';
import {
	GARDEN_CHIP_MAX_LEVEL,
	GARDEN_CHIPS,
	type GardenChipInfo,
	getChipLevel,
	getChipRarity,
} from '../../constants/chips.js';
import { CROP_INFO, type Crop } from '../../constants/crops.js';
import {
	BESTIARY_PEST_BRACKETS,
	DEFAULT_GARDEN_BESTIARY_PEST_BRACKET,
	GARDEN_BESTIARY_BRACKETS,
	PEST_BESTIARY_IDS,
} from '../../constants/pests.js';
import { Rarity } from '../../constants/reforges.js';
import {
	ANITA_FORTUNE_UPGRADE,
	COMMUNITY_CENTER_UPGRADE,
	DNA_MILESTONE_SOURCE,
	FARMING_LEVEL,
	FILLED_ROSEWATER_FLASK_SOURCE,
	PEST_BESTIARY_SOURCE,
	REFINED_TRUFFLE_SOURCE,
	UNLOCKED_PLOTS,
	WRIGGLING_LARVA_SOURCE,
} from '../../constants/specific.js';
import { Stat } from '../../constants/stats.js';
import { type FortuneUpgrade, UpgradeAction, UpgradeCategory } from '../../constants/upgrades.js';
import { FarmingAccessory } from '../../fortune/farmingaccessory.js';
import { FARMING_ACCESSORIES_INFO, type FarmingAccessoryInfo } from '../../items/accessories.js';
import type { FarmingPlayer } from '../../player/player.js';
import { getNextPlotCost } from '../../util/garden.js';
import { fortuneFromPestBestiary, getGardenBestiaryProgress } from '../../util/pests.js';
import type { CalculateCropDetailedDropsOptions } from '../../util/ratecalc.js';
import { getFortune } from '../getfortune.js';
import { getSourceProgress } from '../getsourceprogress.js';
import type { DynamicFortuneSource } from './dynamicfortunesources.js';

export const GARDEN_CHIP_SOURCES: DynamicFortuneSource<FarmingPlayer>[] = Object.entries(GARDEN_CHIPS).map(
	([chipId, chip]) => mapChipSource(chipId as keyof typeof GARDEN_CHIPS, chip)
);

function getLevelDeltaStats(
	currentLevel: number,
	nextLevel: number,
	source: { fortunePerLevel: number; statsPerLevel?: Partial<Record<Stat, number>> }
): Partial<Record<Stat, number>> {
	const result: Partial<Record<Stat, number>> = {};
	// Always include FarmingFortune
	const ff = (source.fortunePerLevel ?? 0) * (nextLevel - currentLevel);
	if (ff !== 0) result[Stat.FarmingFortune] = ff;
	for (const [k, per] of Object.entries(source.statsPerLevel ?? {})) {
		const stat = k as Stat;
		const diff = (per ?? 0) * (nextLevel - currentLevel);
		if (diff !== 0) result[stat] = diff;
	}
	return result;
}

export const GENERAL_FORTUNE_SOURCES: DynamicFortuneSource<FarmingPlayer>[] = [
	{
		name: FARMING_LEVEL.name,
		wiki: () => FARMING_LEVEL.wiki,
		exists: () => true,
		max: () => FARMING_LEVEL.maxLevel * FARMING_LEVEL.fortunePerLevel,
		current: (player) => {
			return (player.options.farmingLevel ?? 0) * FARMING_LEVEL.fortunePerLevel;
		},
		maxStat: (_player, stat) => getFortune(FARMING_LEVEL.maxLevel, FARMING_LEVEL, stat),
		currentStat: (player, stat) => getFortune(player.options.farmingLevel, FARMING_LEVEL, stat),
		upgrades: (player) => {
			const current = player.options.farmingLevel ?? 0;
			if (current < 50 || current >= FARMING_LEVEL.maxLevel) return [];

			const nextCost = FARMING_LEVEL.upgradeCosts?.[current + 1];
			if (!nextCost) return [];

			const stats = getLevelDeltaStats(current, current + 1, FARMING_LEVEL);
			return [
				{
					title: FARMING_LEVEL.name + ' ' + (current + 1),
					increase: stats[Stat.FarmingFortune] ?? 0,
					stats,
					action: UpgradeAction.LevelUp,
					category: UpgradeCategory.Skill,
					wiki: FARMING_LEVEL.wiki,
					cost: nextCost,
					meta: {
						type: 'skill',
						key: 'farmingLevel',
						value: current + 1,
					},
				},
			];
		},
	},
	{
		name: 'Attribute Shards',
		wiki: () => 'https://w.elitesb.gg/Attributes',
		exists: () => true,
		max: () => {
			return ATTRIBUTE_FORTUNE_SOURCES.filter(
				(shard) => !shard.active || shard.active(maxShardOptions).active
			).reduce((acc, shard) => {
				return acc + shard.max(maxShardOptions);
			}, 0);
		},
		current: (player) => {
			return ATTRIBUTE_FORTUNE_SOURCES.reduce((acc, shard) => {
				return acc + shard.current(player);
			}, 0);
		},
		maxStat: (_player, stat) => {
			if (stat === Stat.FarmingFortune) {
				return ATTRIBUTE_FORTUNE_SOURCES.filter(
					(shard) => !shard.active || shard.active(maxShardOptions).active
				).reduce((acc, shard) => acc + shard.max(maxShardOptions), 0);
			}
			return Object.values(FARMING_ATTRIBUTE_SHARDS).reduce(
				(acc, shard) => acc + getShardStat(shard, maxShardOptions, stat, 10),
				0
			);
		},
		currentStat: (player, stat) => {
			if (stat === Stat.FarmingFortune) {
				return ATTRIBUTE_FORTUNE_SOURCES.reduce((acc, shard) => acc + shard.current(player), 0);
			}
			return Object.values(FARMING_ATTRIBUTE_SHARDS).reduce(
				(acc, shard) => acc + getShardStat(shard, player, stat),
				0
			);
		},
		upgrades: (player, stats) => {
			return ATTRIBUTE_SHARD_PROGRESS_SOURCES.filter((shard) => shard.active?.(player).active !== false)
				.flatMap((shard) => shard.upgrades?.(player, stats))
				.filter(Boolean) as FortuneUpgrade[];
		},
		progress: (player, stats) => {
			return getSourceProgress<FarmingPlayer>(player, ATTRIBUTE_SHARD_PROGRESS_SOURCES, false, stats);
		},
	},
	{
		name: 'Garden Chips',
		alwaysInclude: true,
		active: () => ({
			active: true,
			reason: 'Garden Chips should be upgraded, but are hard to give fortune numbers for.',
		}),
		exists: () => true,
		max: () => {
			// Only chips with farming fortune increases
			const maxFortune = Object.values(GARDEN_CHIPS).reduce((acc, chip) => {
				const fortunePerLevel = chip.statsPerRarity?.[Rarity.Legendary]?.[Stat.FarmingFortune] ?? 0;
				return acc + fortunePerLevel * GARDEN_CHIP_MAX_LEVEL;
			}, 0);
			return maxFortune;
		},
		current: (player) => {
			// Only return current fortune from chips with farming fortune increases
			const totalCurrent = Object.entries(GARDEN_CHIPS).reduce((acc, [chipId, chip]) => {
				const level = getChipLevel(player.options.chips?.[chipId as keyof typeof GARDEN_CHIPS]);
				const fortunePerLevel = chip.statsPerRarity?.[Rarity.Legendary]?.[Stat.FarmingFortune] ?? 0;
				return acc + fortunePerLevel * level;
			}, 0);
			return totalCurrent;
		},
		maxStat: (player, stat) => {
			return Object.values(GARDEN_CHIPS).reduce((acc, chip) => {
				const per = chip.statsPerRarity?.[Rarity.Legendary]?.[stat] ?? 0;
				return acc + per * GARDEN_CHIP_MAX_LEVEL;
			}, 0);
		},
		currentStat: (player, stat) => {
			return Object.entries(GARDEN_CHIPS).reduce((acc, [chipId, chip]) => {
				const level = getChipLevel(player.options.chips?.[chipId as keyof typeof GARDEN_CHIPS]);
				const rarity = getChipRarity(level);
				const per = chip.statsPerRarity?.[rarity]?.[stat] ?? 0;
				return acc + per * level;
			}, 0);
		},
		progress: (player, stats) => {
			return getSourceProgress<FarmingPlayer>(player, GARDEN_CHIP_SOURCES, false, stats);
		},
		upgrades: (player, stats) => {
			return GARDEN_CHIP_SOURCES.flatMap((source) => source.upgrades?.(player, stats)).filter(
				Boolean
			) as FortuneUpgrade[];
		},
	},
	{
		name: PEST_BESTIARY_SOURCE.name,
		wiki: () => PEST_BESTIARY_SOURCE.wiki,
		exists: () => true,
		max: () => PEST_BESTIARY_SOURCE.maxLevel * PEST_BESTIARY_SOURCE.fortunePerLevel,
		current: (player) => {
			return fortuneFromPestBestiary(player.options.bestiaryKills ?? {});
		},
		progress: (player, stats) => {
			const list = getGardenBestiaryProgress(player.options.bestiaryKills ?? {});
			return Object.entries(list).map(([bestiaryId, pest]) => {
				const pestId = PEST_BESTIARY_IDS[bestiaryId] ?? null;
				const bracket =
					(pestId ? BESTIARY_PEST_BRACKETS[pestId] : GARDEN_BESTIARY_BRACKETS[bestiaryId]) ??
					DEFAULT_GARDEN_BESTIARY_PEST_BRACKET;
				const totalBrackets = Object.keys(bracket).length;
				const maxFortune = totalBrackets * PEST_BESTIARY_SOURCE.fortunePerLevel;

				return {
					name: pest.name,
					current: pest.bracketsUnlocked * PEST_BESTIARY_SOURCE.fortunePerLevel,
					stats: {
						[Stat.FarmingFortune]: {
							current: pest.bracketsUnlocked * PEST_BESTIARY_SOURCE.fortunePerLevel,
							max: maxFortune,
							ratio:
								maxFortune === 0
									? 0
									: (pest.bracketsUnlocked * PEST_BESTIARY_SOURCE.fortunePerLevel) / maxFortune,
						},
					},
					max: maxFortune,
					ratio: totalBrackets === 0 ? 0 : pest.bracketsUnlocked / totalBrackets,
				};
			});
		},
	},
	{
		name: ANITA_FORTUNE_UPGRADE.name,
		wiki: () => ANITA_FORTUNE_UPGRADE.wiki,
		exists: () => true,
		max: () => ANITA_FORTUNE_UPGRADE.maxLevel * ANITA_FORTUNE_UPGRADE.fortunePerLevel,
		current: (player) => {
			return (player.options.anitaBonus ?? 0) * ANITA_FORTUNE_UPGRADE.fortunePerLevel;
		},
		maxStat: (_player, stat) => getFortune(ANITA_FORTUNE_UPGRADE.maxLevel, ANITA_FORTUNE_UPGRADE, stat),
		currentStat: (player, stat) => getFortune(player.options.anitaBonus, ANITA_FORTUNE_UPGRADE, stat),
		upgrades: (player) => {
			const current = player.options.anitaBonus ?? 0;
			if (current >= ANITA_FORTUNE_UPGRADE.maxLevel) return [];

			const nextCost = ANITA_FORTUNE_UPGRADE.upgradeCosts?.[current + 1];
			if (!nextCost) return [];

			const stats = getLevelDeltaStats(current, current + 1, ANITA_FORTUNE_UPGRADE);
			return [
				{
					title: ANITA_FORTUNE_UPGRADE.name,
					increase: stats[Stat.FarmingFortune] ?? 0,
					stats,
					action: UpgradeAction.Upgrade,
					category: UpgradeCategory.Anita,
					wiki: ANITA_FORTUNE_UPGRADE.wiki,
					cost: nextCost,
					meta: {
						type: 'skill',
						key: 'anitaBonus',
						value: current + 1,
					},
				},
			];
		},
	},
	{
		name: UNLOCKED_PLOTS.name,
		wiki: () => UNLOCKED_PLOTS.wiki,
		exists: () => true,
		max: () => UNLOCKED_PLOTS.maxLevel * UNLOCKED_PLOTS.fortunePerLevel,
		current: (player) => {
			return (player.options.plots?.length ?? player.options.plotsUnlocked ?? 0) * UNLOCKED_PLOTS.fortunePerLevel;
		},
		maxStat: (_player, stat) => getFortune(UNLOCKED_PLOTS.maxLevel, UNLOCKED_PLOTS, stat),
		currentStat: (player, stat) =>
			getFortune(player.options.plots?.length ?? player.options.plotsUnlocked, UNLOCKED_PLOTS, stat),
		upgrades: (player) => {
			const plotUpgrade = getNextPlotCost(player.options.plots ?? []);
			if (!plotUpgrade) return [];
			const current = player.options.plots?.length ?? player.options.plotsUnlocked ?? 0;
			const stats = getLevelDeltaStats(current, current + 1, UNLOCKED_PLOTS);

			return [
				{
					title: 'Plot ' + plotUpgrade.plot?.name,
					increase: stats[Stat.FarmingFortune] ?? 0,
					stats,
					action: UpgradeAction.Purchase,
					category: UpgradeCategory.Plot,
					cost: plotUpgrade.cost,
					meta: {
						type: 'plot',
						id: plotUpgrade.plotId,
						value: current + 1,
					},
				},
			];
		},
	},
	{
		name: COMMUNITY_CENTER_UPGRADE.name,
		api: false,
		wiki: () => COMMUNITY_CENTER_UPGRADE.wiki,
		exists: () => true,
		max: () => COMMUNITY_CENTER_UPGRADE.maxLevel * COMMUNITY_CENTER_UPGRADE.fortunePerLevel,
		current: (player) => {
			return (player.options.communityCenter ?? 0) * COMMUNITY_CENTER_UPGRADE.fortunePerLevel;
		},
		maxStat: (_player, stat) => getFortune(COMMUNITY_CENTER_UPGRADE.maxLevel, COMMUNITY_CENTER_UPGRADE, stat),
		currentStat: (player, stat) => getFortune(player.options.communityCenter, COMMUNITY_CENTER_UPGRADE, stat),
		upgrades: (player) => {
			const current = player.options.communityCenter ?? 0;
			if (current >= COMMUNITY_CENTER_UPGRADE.maxLevel) return [];
			const stats = getLevelDeltaStats(current, current + 1, COMMUNITY_CENTER_UPGRADE);

			return [
				{
					title: COMMUNITY_CENTER_UPGRADE.name,
					increase: stats[Stat.FarmingFortune] ?? 0,
					stats,
					action: UpgradeAction.Upgrade,
					repeatable: COMMUNITY_CENTER_UPGRADE.maxLevel - current,
					api: false,
					category: UpgradeCategory.CommunityCenter,
					wiki: COMMUNITY_CENTER_UPGRADE.wiki,
					meta: {
						type: 'skill',
						key: 'communityCenter',
						value: current + 1,
					},
				},
			];
		},
	},
	{
		name: 'Helianthus Relic',
		exists: (player) => {
			if (!player.options.selectedCrop) return true;
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.family
			);

			// If player has Helianthus Relic, always show this
			if (highest?.info.skyblockId === 'HELIANTHUS_RELIC') return true;

			const cropFortuneType = CROP_INFO[player.options.selectedCrop]?.fortuneType;
			if (!highest || (cropFortuneType && highest.info.baseStats?.[cropFortuneType])) {
				return false;
			}

			return true;
		},
		wiki: (player) => {
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.family
			);
			return highest?.info.wiki ?? FARMING_ACCESSORIES_INFO.CROPIE_TALISMAN?.wiki;
		},
		max: () => {
			const accessory = FarmingAccessory.fakeItem(
				FARMING_ACCESSORIES_INFO.CROPIE_TALISMAN as FarmingAccessoryInfo
			);
			return accessory?.getLastItemUpgrade()?.info.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
		current: (player) => {
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.family
			);
			if (!highest) return 0;

			if (highest.info.crops) {
				return 0;
			}

			return highest.info.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
		info: (player) => {
			const highest = player.activeAccessories.find((a) => a.info === FARMING_ACCESSORIES_INFO.HELIANTHUS_RELIC);
			const first = !highest ? FARMING_ACCESSORIES_INFO.CROPIE_TALISMAN : undefined;
			return {
				item: highest?.item,
				info: highest?.info,
				nextInfo: first ?? highest?.getNextItemUpgrade()?.info,
				maxInfo: highest?.getLastItemUpgrade()?.info ?? FARMING_ACCESSORIES_INFO.HELIANTHUS_RELIC,
			};
		},
		upgrades: (player) => {
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.HELIANTHUS_RELIC?.family
			);

			if (!highest) {
				const cropie = FARMING_ACCESSORIES_INFO.CROPIE_TALISMAN;
				if (!cropie) return [];

				return [
					{
						title: cropie.name,
						increase: cropie.baseStats?.[Stat.FarmingFortune] ?? 0,
						stats: {
							[Stat.FarmingFortune]: cropie.baseStats?.[Stat.FarmingFortune] ?? 0,
						},
						action: UpgradeAction.Purchase,
						item: 'CROPIE_TALISMAN',
						category: UpgradeCategory.Item,
						wiki: cropie.wiki,
						cost: {
							items: {
								CROPIE_TALISMAN: 1,
							},
						},
						meta: {
							type: 'buy_item',
							id: 'CROPIE_TALISMAN',
						},
						conflictKey: 'accessory:CROPIE_TALISMAN',
					},
				];
			}

			return highest.getUpgrades();
		},
	},
	{
		name: 'Freshly Baked Heirloom',
		exists: () => true,
		wiki: (player) => {
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_HEIRLOOM?.family
			);
			return highest?.info.wiki ?? FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_TALISMAN?.wiki;
		},
		// Overbloom-only source; doesn't contribute to Farming Fortune.
		max: () => 0,
		current: () => 0,
		maxStat: (_player, stat) => {
			if (stat !== Stat.Overbloom) return 0;
			const accessory = FarmingAccessory.fakeItem(
				FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_TALISMAN as FarmingAccessoryInfo
			);
			return accessory?.getLastItemUpgrade()?.info.baseStats?.[Stat.Overbloom] ?? 0;
		},
		currentStat: (player, stat) => {
			if (stat !== Stat.Overbloom) return 0;
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_HEIRLOOM?.family
			);
			return highest?.info.baseStats?.[Stat.Overbloom] ?? 0;
		},
		info: (player) => {
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_HEIRLOOM?.family
			);
			const first = !highest ? FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_TALISMAN : undefined;
			return {
				item: highest?.item,
				info: highest?.info,
				nextInfo: first ?? highest?.getNextItemUpgrade()?.info,
				maxInfo: highest?.getLastItemUpgrade()?.info ?? FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_HEIRLOOM,
			};
		},
		upgrades: (player) => {
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_HEIRLOOM?.family
			);

			if (!highest) {
				const talisman = FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_TALISMAN;
				if (!talisman) return [];

				return [
					{
						title: talisman.name,
						increase: 0,
						stats: {
							[Stat.Overbloom]: talisman.baseStats?.[Stat.Overbloom] ?? 0,
						},
						action: UpgradeAction.Purchase,
						item: 'FRESHLY_BAKED_TALISMAN',
						category: UpgradeCategory.Item,
						wiki: talisman.wiki,
						cost: {
							kernels: 25,
						},
						meta: {
							type: 'buy_item',
							id: 'FRESHLY_BAKED_TALISMAN',
						},
						conflictKey: 'accessory:FRESHLY_BAKED_TALISMAN',
					},
				];
			}

			return highest.getUpgrades({ stat: Stat.Overbloom });
		},
	},
	{
		name: DNA_MILESTONE_SOURCE.name,
		wiki: () => DNA_MILESTONE_SOURCE.wiki,
		exists: () => true,
		max: () => DNA_MILESTONE_SOURCE.maxLevel * DNA_MILESTONE_SOURCE.fortunePerLevel,
		current: (player) => {
			return (player.options.dnaMilestone ?? 0) * DNA_MILESTONE_SOURCE.fortunePerLevel;
		},
		maxStat: (_player, stat) => getFortune(DNA_MILESTONE_SOURCE.maxLevel, DNA_MILESTONE_SOURCE, stat),
		currentStat: (player, stat) => getFortune(player.options.dnaMilestone ?? 0, DNA_MILESTONE_SOURCE, stat),
		upgrades: (player) => {
			const level = player.options.dnaMilestone ?? 0;
			if (level >= DNA_MILESTONE_SOURCE.maxLevel) return [];

			return [
				{
					title: 'DNA Analysis Milestone ' + (level + 1),
					increase: DNA_MILESTONE_SOURCE.fortunePerLevel,
					stats: {
						[Stat.FarmingFortune]: DNA_MILESTONE_SOURCE.fortunePerLevel,
					},
					action: UpgradeAction.LevelUp,
					wiki: DNA_MILESTONE_SOURCE.wiki,
					category: UpgradeCategory.Milestone,
					meta: {
						type: 'setting',
						key: 'dnaMilestone',
						value: level + 1,
					},
				},
			];
		},
	},
	{
		name: 'Relic of Power',
		exists: () => true,
		wiki: () => FARMING_ACCESSORIES_INFO.POWER_RELIC?.wiki,
		max: () => {
			const accessory = FarmingAccessory.fakeItem(FARMING_ACCESSORIES_INFO.POWER_RELIC as FarmingAccessoryInfo);
			return accessory?.getProgress()?.reduce((acc, p) => acc + p.max, 0) ?? 0;
		},
		current: (player) => {
			const accessory = player.accessories.find((a) => a.info.skyblockId === 'POWER_RELIC');
			return accessory?.fortune ?? 0;
		},
		info: (player) => {
			const accessory = player.accessories.find((a) => a.info.skyblockId === 'POWER_RELIC');
			const fake = !accessory
				? FarmingAccessory.fakeItem(FARMING_ACCESSORIES_INFO.POWER_RELIC as FarmingAccessoryInfo)
				: undefined;

			return {
				item: accessory?.item,
				info: accessory?.info,
				nextInfo: fake ? fake.info : accessory?.getNextItemUpgrade()?.info,
				maxInfo: (fake ? fake : accessory)?.getLastItemUpgrade()?.info,
			};
		},
		upgrades: (player) => {
			const accessory = player.accessories.find((a) => a.info.skyblockId === 'POWER_RELIC');

			if (!accessory)
				return [
					{
						title: 'Relic of Power',
						increase: 0,
						stats: {
							[Stat.FarmingFortune]: 0,
						},
						action: UpgradeAction.Purchase,
						purchase: 'POWER_RELIC',
						category: UpgradeCategory.Item,
						wiki: FARMING_ACCESSORIES_INFO.POWER_RELIC?.wiki,
						cost: FARMING_ACCESSORIES_INFO.POWER_RELIC?.cost,
						meta: {
							type: 'buy_item',
							id: 'POWER_RELIC',
						},
						conflictKey: 'accessory:POWER_RELIC',
					},
				];

			return accessory.getUpgrades();
		},
	},
	{
		name: 'Magic 8 Ball',
		exists: () => true,
		wiki: () => 'https://w.elitesb.gg/Magic_8_Ball',
		max: () => 25,
		active: () => {
			return {
				active: true,
				reason: 'Magic 8 Ball only has a 20% chance to be active each season.',
			};
		},
		current: (player) => {
			const accessory = player.accessories.find((a) => a.info.skyblockId === 'MAGIC_8_BALL');
			return accessory ? 25 : 0;
		},
		upgrades: (player) => {
			const accessory = player.accessories.find((a) => a.info.skyblockId === 'MAGIC_8_BALL');

			if (!accessory)
				return [
					{
						title: 'Magic 8 Ball',
						increase: 25 * 0.2,
						stats: {
							[Stat.FarmingFortune]: 25 * 0.2,
						},
						action: UpgradeAction.Purchase,
						purchase: 'MAGIC_8_BALL',
						category: UpgradeCategory.Item,
						wiki: 'https://w.elitesb.gg/Magic_8_Ball',
						cost: {
							items: {
								MAGIC_8_BALL: 1,
							},
						},
						meta: {
							type: 'buy_item',
							id: 'MAGIC_8_BALL',
						},
						conflictKey: 'accessory:MAGIC_8_BALL',
					},
				];

			return [];
		},
	},
	{
		name: 'Atmospheric Filter',
		exists: () => true,
		wiki: () => 'https://w.elitesb.gg/Atmospheric_Filter',
		max: () => 25,
		active: () => {
			return {
				active: true,
				reason: 'Atmospheric Filter only gives fortune during the Spring season.',
			};
		},
		current: (player) => {
			const accessory = player.accessories.find((a) => a.info.skyblockId === 'ATMOSPHERIC_FILTER');
			return accessory ? 25 : 0;
		},
		upgrades: (player) => {
			const accessory = player.accessories.find((a) => a.info.skyblockId === 'ATMOSPHERIC_FILTER');
			if (accessory) return [];

			return [
				{
					title: 'Atmospheric Filter',
					increase: 25 * 0.25,
					stats: {
						[Stat.FarmingFortune]: 25 * 0.25,
					},
					action: UpgradeAction.Purchase,
					purchase: 'ATMOSPHERIC_FILTER',
					category: UpgradeCategory.Item,
					wiki: 'https://w.elitesb.gg/Atmospheric_Filter',
					cost: {
						items: {
							ATMOSPHERIC_FILTER: 1,
						},
					},
					meta: {
						type: 'buy_item',
						id: 'ATMOSPHERIC_FILTER',
					},
					conflictKey: 'accessory:ATMOSPHERIC_FILTER',
				},
			];
		},
	},
	{
		name: REFINED_TRUFFLE_SOURCE.name,
		wiki: () => REFINED_TRUFFLE_SOURCE.wiki,
		exists: () => true,
		max: () => REFINED_TRUFFLE_SOURCE.maxLevel * REFINED_TRUFFLE_SOURCE.fortunePerLevel,
		current: (player) => {
			return (player.options.refinedTruffles ?? 0) * REFINED_TRUFFLE_SOURCE.fortunePerLevel;
		},
		maxStat: (_player, stat) => getFortune(REFINED_TRUFFLE_SOURCE.maxLevel, REFINED_TRUFFLE_SOURCE, stat),
		currentStat: (player, stat) => getFortune(player.options.refinedTruffles ?? 0, REFINED_TRUFFLE_SOURCE, stat),
		upgrades: (player) => {
			const consumed = player.options.refinedTruffles ?? 0;
			if (consumed >= 5) return [];

			return [
				{
					title: 'Refined Dark Cacao Truffle',
					increase: REFINED_TRUFFLE_SOURCE.fortunePerLevel,
					stats: {
						[Stat.FarmingFortune]: REFINED_TRUFFLE_SOURCE.fortunePerLevel,
					},
					action: UpgradeAction.Consume,
					repeatable: 5 - consumed,
					wiki: REFINED_TRUFFLE_SOURCE.wiki,
					category: UpgradeCategory.Item,
					cost: {
						items: {
							REFINED_DARK_CACAO_TRUFFLE: 1,
						},
					},
					meta: {
						type: 'setting',
						key: 'refinedTruffles',
						value: consumed + 1,
					},
				},
			];
		},
	},
	{
		name: FILLED_ROSEWATER_FLASK_SOURCE.name,
		api: false,
		wiki: () => FILLED_ROSEWATER_FLASK_SOURCE.wiki,
		exists: () => true,
		max: () => FILLED_ROSEWATER_FLASK_SOURCE.maxLevel * FILLED_ROSEWATER_FLASK_SOURCE.fortunePerLevel,
		current: (player) => {
			return (player.options.filledRosewaterFlask ?? 0) * FILLED_ROSEWATER_FLASK_SOURCE.fortunePerLevel;
		},
		maxStat: (_player, stat) =>
			getFortune(FILLED_ROSEWATER_FLASK_SOURCE.maxLevel, FILLED_ROSEWATER_FLASK_SOURCE, stat),
		currentStat: (player, stat) =>
			getFortune(player.options.filledRosewaterFlask ?? 0, FILLED_ROSEWATER_FLASK_SOURCE, stat),
		upgrades: (player) => {
			const consumed = player.options.filledRosewaterFlask ?? 0;
			if (consumed >= 5) return [];

			return [
				{
					title: 'Filled Rosewater Flask',
					increase: FILLED_ROSEWATER_FLASK_SOURCE.fortunePerLevel,
					stats: {
						[Stat.FarmingFortune]: FILLED_ROSEWATER_FLASK_SOURCE.fortunePerLevel,
					},
					api: false,
					action: UpgradeAction.Consume,
					repeatable: 5 - consumed,
					wiki: FILLED_ROSEWATER_FLASK_SOURCE.wiki,
					category: UpgradeCategory.Item,
					cost: {
						items: {
							FILLED_ROSEWATER_FLASK: 1,
						},
					},
					meta: {
						type: 'setting',
						key: 'filledRosewaterFlasks',
						value: consumed + 1,
					},
				},
			];
		},
	},
	{
		name: WRIGGLING_LARVA_SOURCE.name,
		wiki: () => WRIGGLING_LARVA_SOURCE.wiki,
		exists: () => true,
		max: () => 0,
		current: () => 0,
		maxStat: (_player, stat) => getFortune(WRIGGLING_LARVA_SOURCE.maxLevel, WRIGGLING_LARVA_SOURCE, stat),
		currentStat: (player, stat) => getFortune(player.options.wrigglingLarva ?? 0, WRIGGLING_LARVA_SOURCE, stat),
		upgrades: (player, stats) => {
			if (!stats?.includes(Stat.BonusPestChance)) return [];
			const consumed = player.options.wrigglingLarva ?? 0;
			if (consumed >= 5) return [];

			return [
				{
					title: 'Wriggling Larva',
					increase: 0,
					stats: {
						[Stat.BonusPestChance]: WRIGGLING_LARVA_SOURCE.statsPerLevel?.[Stat.BonusPestChance] ?? 0,
					},
					action: UpgradeAction.Consume,
					repeatable: 5 - consumed,
					wiki: WRIGGLING_LARVA_SOURCE.wiki,
					category: UpgradeCategory.Item,
					cost: {
						items: {
							WRIGGLING_LARVA: 1,
						},
					},
					meta: {
						type: 'setting',
						key: 'wrigglingLarva',
						value: consumed + 1,
					},
				},
			];
		},
	},
	...createCarnivalHarvestFeastSources(),
];

interface CarnivalPerk {
	key: string;
	name: string;
	wiki: string;
	stat: Stat;
	maxLevel: number;
	perLevel: number;
}

function getCarnivalPerkLevel(player: FarmingPlayer, key: string): number {
	const raw = player.options.harvestFeast?.perks?.[key] ?? player.options.perks?.[key];
	if (raw === null || raw === undefined) return 0;
	const level = typeof raw === 'number' ? raw : parseInt(raw, 10);
	return Number.isFinite(level) ? level : 0;
}

function getCarnivalPerkFortune(player: FarmingPlayer, perk: CarnivalPerk): number {
	return getCarnivalPerkLevel(player, perk.key) * perk.perLevel;
}

function isHarvestFeastActive(player: FarmingPlayer): boolean {
	return player.options.harvestFeast?.active === true;
}

function createCarnivalHarvestFeastSources(): DynamicFortuneSource<FarmingPlayer>[] {
	const perks: CarnivalPerk[] = [
		{
			key: 'natural_talent',
			name: 'Natural Talent',
			wiki: 'https://w.elitesb.gg/Doug',
			stat: Stat.Overbloom,
			maxLevel: 5,
			perLevel: 1,
		},
		{
			key: 'fortunate_feasting',
			name: 'Fortunate Feasting',
			wiki: 'https://w.elitesb.gg/Doug',
			stat: Stat.FarmingFortune,
			maxLevel: 5,
			perLevel: 5,
		},
	];
	return perks.map((perk) => ({
		name: perk.name,
		wiki: () => perk.wiki,
		exists: () => true,
		active: (player) => {
			if (isHarvestFeastActive(player)) return { active: true };
			return {
				active: false,
				reason: 'Only active during a Harvest Feast.',
				fortune: perk.stat === Stat.FarmingFortune ? getCarnivalPerkFortune(player, perk) : 0,
			};
		},
		max: () => (perk.stat === Stat.FarmingFortune ? perk.maxLevel * perk.perLevel : 0),
		current: (player) => {
			if (perk.stat !== Stat.FarmingFortune) return 0;
			if (!isHarvestFeastActive(player)) return 0;
			return getCarnivalPerkFortune(player, perk);
		},
		maxStat: (_player, stat) => (stat === perk.stat ? perk.maxLevel * perk.perLevel : 0),
		currentStat: (player, stat) => {
			if (stat !== perk.stat || !isHarvestFeastActive(player)) return 0;
			return getCarnivalPerkFortune(player, perk);
		},
		activeStat: (player, stat) => {
			if (stat !== perk.stat) return { active: isHarvestFeastActive(player) };
			return {
				active: isHarvestFeastActive(player),
				value: getCarnivalPerkFortune(player, perk),
			};
		},
		progress: (player) => {
			const level = getCarnivalPerkLevel(player, perk.key);
			if (level <= 0) return undefined;
			return [
				{
					name: 'Level',
					current: level,
					max: perk.maxLevel,
					maxLevel: perk.maxLevel,
					fortunePerLevel: perk.perLevel,
					ratio: Math.min(level / perk.maxLevel, 1),
				},
			];
		},
	}));
}

export const ATTRIBUTE_FORTUNE_SOURCES: DynamicFortuneSource<FarmingPlayer | CalculateCropDetailedDropsOptions>[] =
	Object.entries(FARMING_ATTRIBUTE_SHARDS)
		.filter((a) => a[1].effect === 'fortune')
		.map(([id, shard]) => mapShardSource(id, shard));

// Includes all shards (fortune + non-fortune effects) so per-stat progress and upgrades
// can surface shards like Cropeetle that contribute non-FarmingFortune stats.
export const ATTRIBUTE_SHARD_PROGRESS_SOURCES: DynamicFortuneSource<
	FarmingPlayer | CalculateCropDetailedDropsOptions
>[] = Object.entries(FARMING_ATTRIBUTE_SHARDS).map(([id, shard]) => mapShardSource(id, shard));

const maxShardOptions = {
	attributes: Object.fromEntries(
		Object.keys(FARMING_ATTRIBUTE_SHARDS).map((id) => [
			id,
			1000, // Max level for all shards
		])
	),
	blocksBroken: 0,
	crop: 'CACTUS' as Crop,
	bountiful: false,
	mooshroom: false,
	infestedPlotProbability: 1,
};

function mapShardSource(
	id: string,
	shard: (typeof FARMING_ATTRIBUTE_SHARDS)[keyof typeof FARMING_ATTRIBUTE_SHARDS]
): DynamicFortuneSource<FarmingPlayer | CalculateCropDetailedDropsOptions> {
	const result = {
		name: shard.name,
		wiki: () => shard.wiki,
		exists: () => true,
		active: shard.active,
		max: () => {
			return getShardFortune(
				shard,
				{
					...maxShardOptions,
					attributes: { [id]: 1000 },
				},
				10
			);
		},
		current: (player) => {
			return getShardFortune(shard, player);
		},
		maxStat: (_player, stat) => {
			if (stat === Stat.FarmingFortune) {
				return getShardFortune(
					shard,
					{
						...maxShardOptions,
						attributes: { [id]: 1000 },
					},
					10
				);
			}
			return getShardStat(
				shard,
				{
					...maxShardOptions,
					attributes: { [id]: 1000 },
				},
				stat,
				10
			);
		},
		currentStat: (player, stat) => {
			if (stat === Stat.FarmingFortune) return getShardFortune(shard, player);
			return getShardStat(shard, player, stat);
		},
		upgrades: (player, stats) => {
			const amount = player.attributes?.[id] ?? 0;
			const nextCost = getShardsForNextLevel(shard.rarity, amount);
			if (!nextCost) return [];

			const currentLevel = getShardLevel(shard.rarity, amount);
			const level = currentLevel + 1;

			const deltaStats: Partial<Record<Stat, number>> = {};
			for (const s of Object.values(Stat)) {
				const before = getShardStat(shard, player, s, currentLevel);
				const after = getShardStat(shard, player, s, level);
				const diff = after - before;
				if (diff !== 0) deltaStats[s] = diff;
			}

			// If a specific stat is requested, only surface this shard when it affects it.
			if (stats && stats.length > 0) {
				const affects = stats.some((s) => (deltaStats[s] ?? 0) !== 0);
				if (!affects) return [];
			}

			const increase = deltaStats[Stat.FarmingFortune] ?? 0;

			return [
				{
					title: shard.name.replace('Shard', level.toString()),
					increase,
					stats: deltaStats,
					action: UpgradeAction.LevelUp,
					category: UpgradeCategory.Attribute,
					// wiki: shard.wiki, // Wiki page doesn't exist yet
					cost: {
						items: {
							[shard.skyblockId]: nextCost,
						},
					},
					meta: {
						type: 'attribute',
						key: id,
						value: getShardsForLevel(shard.rarity, level),
					},
				},
			];
		},
	} as DynamicFortuneSource<FarmingPlayer | CalculateCropDetailedDropsOptions>;

	return result;
}

function mapChipSource(chipId: keyof typeof GARDEN_CHIPS, chip: GardenChipInfo): DynamicFortuneSource<FarmingPlayer> {
	return {
		name: chip.name,
		alwaysInclude: true,
		wiki: () => chip.wiki,
		exists: () => true,
		// Progress-only display (avoid default Farming Fortune icon): show level in nested progress.
		max: () => 0,
		current: () => 0,
		maxStat: (player, stat) => {
			const per = chip.statsPerRarity?.[Rarity.Legendary]?.[stat] ?? 0;
			return per * GARDEN_CHIP_MAX_LEVEL;
		},
		currentStat: (player, stat) => {
			const level = getChipLevel(player.options.chips?.[chipId]);
			const rarity = getChipRarity(level);
			const per = chip.statsPerRarity?.[rarity]?.[stat] ?? 0;
			return per * level;
		},
		active: (player) => {
			if (chip.skyblockId !== 'OVERDRIVE_GARDEN_CHIP') return { active: true };
			if (!player.options.jacobContest?.enabled) {
				return { active: false, reason: "Overdrive only applies during Jacob's Contest." };
			}
			if (!player.options.jacobContest.crop) {
				return { active: false, reason: "Select an active Jacob's Contest crop to apply Overdrive." };
			}
			return { active: true, reason: `Applies to ${player.options.jacobContest.crop} during contest.` };
		},
		progress: (player) => {
			const level = getChipLevel(player.options.chips?.[chipId]);
			return [
				{
					name: 'Level',
					current: level,
					max: GARDEN_CHIP_MAX_LEVEL,
					ratio: Math.min(isNaN(level / GARDEN_CHIP_MAX_LEVEL) ? 0 : level / GARDEN_CHIP_MAX_LEVEL, 1),
				},
			];
		},
		upgrades: (player, stats) => {
			const currentLevel = getChipLevel(player.options.chips?.[chipId]);
			if (currentLevel >= GARDEN_CHIP_MAX_LEVEL) return [];

			// If a specific stat is requested, only offer upgrades that affect it.
			if (stats && stats.length > 0 && chip.statsPerRarity) {
				const affectsRequested = stats.some((s) => (chip.statsPerRarity?.[Rarity.Legendary]?.[s] ?? 0) !== 0);
				if (!affectsRequested) return [];
			}

			const nextLevel = currentLevel + 1;
			const deltaStats: Partial<Record<Stat, number>> = {};
			const currentRarity = getChipRarity(currentLevel);
			const nextRarity = getChipRarity(nextLevel);
			for (const [k, v] of Object.entries(chip.statsPerRarity?.[nextRarity] ?? {})) {
				const stat = k as Stat;
				const before = (chip.statsPerRarity?.[currentRarity]?.[stat] ?? 0) * currentLevel;
				const after = (v ?? 0) * nextLevel;
				const diff = after - before;
				if (diff !== 0) deltaStats[stat] = diff;
			}

			return [
				{
					title: `${chip.name} ${nextLevel}`,
					increase: deltaStats[Stat.FarmingFortune] ?? 0,
					stats: Object.keys(deltaStats).length > 0 ? deltaStats : undefined,
					action: UpgradeAction.LevelUp,
					category: UpgradeCategory.Misc,
					cost: {
						items: {
							[chip.skyblockId]: 1,
						},
					},
					meta: {
						type: 'chip',
						id: chip.skyblockId,
						value: nextLevel,
					},
				},
			];
		},
	};
}
