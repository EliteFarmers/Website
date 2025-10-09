import {
	FARMING_ATTRIBUTE_SHARDS,
	getShardFortune,
	getShardLevel,
	getShardsForNextLevel,
} from '../../constants/attributes.js';
import type { Crop } from '../../constants/crops.js';
import {
	ANITA_FORTUNE_UPGRADE,
	COMMUNITY_CENTER_UPGRADE,
	FARMING_LEVEL,
	PEST_BESTIARY_SOURCE,
	REFINED_TRUFFLE_SOURCE,
	UNLOCKED_PLOTS,
} from '../../constants/specific.js';
import { Stat } from '../../constants/stats.js';
import { type FortuneUpgrade, UpgradeAction, UpgradeCategory } from '../../constants/upgrades.js';
import { FarmingAccessory } from '../../fortune/farmingaccessory.js';
import { FARMING_ACCESSORIES_INFO, type FarmingAccessoryInfo } from '../../items/accessories.js';
import type { FarmingPlayer } from '../../player/player.js';
import { getNextPlotCost } from '../../util/garden.js';
import { fortuneFromPestBestiary } from '../../util/pests.js';
import type { CalculateCropDetailedDropsOptions } from '../../util/ratecalc.js';
import { getSourceProgress } from '../getsourceprogress.js';
import type { DynamicFortuneSource } from './dynamicfortunesources.js';

export const GENERAL_FORTUNE_SOURCES: DynamicFortuneSource<FarmingPlayer>[] = [
	{
		name: FARMING_LEVEL.name,
		wiki: () => FARMING_LEVEL.wiki,
		exists: () => true,
		max: () => FARMING_LEVEL.maxLevel * FARMING_LEVEL.fortunePerLevel,
		current: (player) => {
			return (player.options.farmingLevel ?? 0) * FARMING_LEVEL.fortunePerLevel;
		},
		upgrades: (player) => {
			const current = player.options.farmingLevel ?? 0;
			if (current < 50 || current >= FARMING_LEVEL.maxLevel) return [];

			const nextCost = FARMING_LEVEL.upgradeCosts?.[current + 1];
			if (!nextCost) return [];

			return [
				{
					title: FARMING_LEVEL.name + ' ' + (current + 1),
					increase: FARMING_LEVEL.fortunePerLevel,
					action: UpgradeAction.LevelUp,
					category: UpgradeCategory.Skill,
					wiki: FARMING_LEVEL.wiki,
					cost: nextCost,
				},
			];
		},
	},
	{
		name: 'Attribute Shards',
		api: false,
		wiki: () => 'https://wiki.hypixel.net/Attributes',
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
		upgrades: (player) => {
			return ATTRIBUTE_FORTUNE_SOURCES.filter((shard) => shard.active?.(player).active !== false)
				.flatMap((shard) => shard.upgrades?.(player))
				.filter(Boolean) as FortuneUpgrade[];
		},
		progress: (player) => {
			return getSourceProgress<FarmingPlayer>(player, ATTRIBUTE_FORTUNE_SOURCES);
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
	},
	{
		name: ANITA_FORTUNE_UPGRADE.name,
		wiki: () => ANITA_FORTUNE_UPGRADE.wiki,
		exists: () => true,
		max: () => ANITA_FORTUNE_UPGRADE.maxLevel * ANITA_FORTUNE_UPGRADE.fortunePerLevel,
		current: (player) => {
			return (player.options.anitaBonus ?? 0) * ANITA_FORTUNE_UPGRADE.fortunePerLevel;
		},
		upgrades: (player) => {
			const current = player.options.anitaBonus ?? 0;
			if (current >= ANITA_FORTUNE_UPGRADE.maxLevel) return [];

			const nextCost = ANITA_FORTUNE_UPGRADE.upgradeCosts?.[current + 1];
			if (!nextCost) return [];

			return [
				{
					title: ANITA_FORTUNE_UPGRADE.name,
					increase: ANITA_FORTUNE_UPGRADE.fortunePerLevel,
					action: UpgradeAction.Upgrade,
					category: UpgradeCategory.Anita,
					wiki: ANITA_FORTUNE_UPGRADE.wiki,
					cost: nextCost,
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
		upgrades: (player) => {
			const plotUpgrade = getNextPlotCost(player.options.plots ?? []);
			if (!plotUpgrade) return [];

			return [
				{
					title: 'Plot ' + plotUpgrade.plot?.name,
					increase: UNLOCKED_PLOTS.fortunePerLevel,
					action: UpgradeAction.Purchase,
					category: UpgradeCategory.Plot,
					cost: plotUpgrade.cost,
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
		upgrades: (player) => {
			const current = player.options.communityCenter ?? 0;
			if (current >= COMMUNITY_CENTER_UPGRADE.maxLevel) return [];

			return [
				{
					title: COMMUNITY_CENTER_UPGRADE.name,
					increase: COMMUNITY_CENTER_UPGRADE.fortunePerLevel,
					action: UpgradeAction.Upgrade,
					repeatable: COMMUNITY_CENTER_UPGRADE.maxLevel - current,
					api: false,
					category: UpgradeCategory.CommunityCenter,
					wiki: COMMUNITY_CENTER_UPGRADE.wiki,
				},
			];
		},
	},
	{
		name: 'Fermento Artifact',
		exists: () => true,
		wiki: (player) => {
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.family
			);
			return highest?.info.wiki ?? FARMING_ACCESSORIES_INFO.CROPIE_TALISMAN?.wiki;
		},
		max: () => FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.baseStats?.[Stat.FarmingFortune] ?? 0,
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
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.family
			);
			const first = !highest ? FARMING_ACCESSORIES_INFO.CROPIE_TALISMAN : undefined;
			return {
				item: highest?.item,
				info: highest?.info,
				nextInfo: first ?? highest?.getNextItemUpgrade()?.info,
				maxInfo: highest?.getLastItemUpgrade()?.info ?? FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT,
			};
		},
		upgrades: (player) => {
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.family
			);

			if (!highest) {
				const cropie = FARMING_ACCESSORIES_INFO.CROPIE_TALISMAN;
				if (!cropie) return [];

				return [
					{
						title: cropie.name,
						increase: cropie.baseStats?.[Stat.FarmingFortune] ?? 0,
						action: UpgradeAction.Purchase,
						item: 'CROPIE_TALISMAN',
						category: UpgradeCategory.Item,
						wiki: cropie.wiki,
						cost: {
							items: {
								CROPIE_TALISMAN: 1,
							},
						},
					},
				];
			}

			return highest.getUpgrades();
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
		upgrades: (player) => {
			const consumed = player.options.refinedTruffles ?? 0;
			if (consumed >= 5) return [];

			return [
				{
					title: 'Refined Dark Cacao Truffle',
					increase: REFINED_TRUFFLE_SOURCE.fortunePerLevel,
					action: UpgradeAction.Consume,
					repeatable: 5 - consumed,
					wiki: REFINED_TRUFFLE_SOURCE.wiki,
					category: UpgradeCategory.Item,
					cost: {
						items: {
							REFINED_DARK_CACAO_TRUFFLE: 1,
						},
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
			return accessory?.getProgress()?.reduce((acc, p) => acc + p.maxFortune, 0) ?? 0;
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
						action: UpgradeAction.Purchase,
						purchase: 'POWER_RELIC',
						category: UpgradeCategory.Item,
						wiki: FARMING_ACCESSORIES_INFO.POWER_RELIC?.wiki,
						cost: FARMING_ACCESSORIES_INFO.POWER_RELIC?.cost,
					},
				];

			return accessory.getUpgrades();
		},
	},
];

export const ATTRIBUTE_FORTUNE_SOURCES: DynamicFortuneSource<FarmingPlayer | CalculateCropDetailedDropsOptions>[] =
	Object.entries(FARMING_ATTRIBUTE_SHARDS)
		.filter((a) => a[1].effect === 'fortune')
		.map(([id, shard]) => mapShardSource(id, shard));

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
		api: false,
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
		upgrades: (player) => {
			const amount = player.attributes?.[id] ?? 0;
			const nextCost = getShardsForNextLevel(shard.rarity, amount);
			if (!nextCost) return [];

			const currentLevel = getShardLevel(shard.rarity, amount);
			const level = currentLevel + 1;

			const currentFortune = getShardFortune(shard, player, currentLevel);
			const nextFortune = getShardFortune(shard, player, level);

			return [
				{
					title: shard.name.replace('Shard', level.toString()),
					api: false,
					increase: nextFortune - currentFortune,
					action: UpgradeAction.LevelUp,
					category: UpgradeCategory.Attribute,
					// wiki: shard.wiki, // Wiki page doesn't exist yet
					cost: {
						items: {
							[shard.skyblockId]: nextCost,
						},
					},
				},
			];
		},
	} as DynamicFortuneSource<FarmingPlayer | CalculateCropDetailedDropsOptions>;

	return result;
}
