import { getChipLevel } from '../../constants/chips.js';
import { CROP_INFO, Crop, EXPORTABLE_CROP_FORTUNE } from '../../constants/crops.js';
import { fortuneFromPersonalBestContest } from '../../constants/personalbests.js';
import { COCOA_FORTUNE_UPGRADE, GARDEN_CROP_UPGRADES } from '../../constants/specific.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeAction, UpgradeCategory } from '../../constants/upgrades.js';
import type { FarmingAccessory } from '../../fortune/farmingaccessory.js';
import type { FarmingTool } from '../../fortune/farmingtool.js';
import { FARMING_ACCESSORIES_INFO } from '../../items/accessories.js';
import type { FarmingPlayer } from '../../player/player.js';
import { getCropDisplayName, getItemIdFromCrop } from '../../util/names.js';
import { getFakeItem, ITEM_REGISTRY } from '../itemregistry.js';
import type { DynamicFortuneSource } from './dynamicfortunesources.js';

export const CROP_FORTUNE_SOURCES: DynamicFortuneSource<{
	player: FarmingPlayer;
	crop: Crop;
}>[] = [
	{
		name: 'Farming Tool',
		exists: () => true,
		wiki: ({ player, crop }) => {
			return (
				player.getSelectedCropTool(crop)?.info.wiki ??
				ITEM_REGISTRY.get(CROP_INFO[crop].startingTool)?.info.wiki
			);
		},
		max: ({ player, crop }) => {
			const tool = player.getSelectedCropTool(crop) ?? getFakeItem(CROP_INFO[crop].startingTool);
			const progress = tool?.getProgress();
			return progress?.reduce((acc, p) => acc + p.max, 0) ?? 0;
		},
		current: ({ player, crop }) => {
			const tool = player.getSelectedCropTool(crop);
			const progress = tool?.getProgress();
			return progress?.reduce((acc, p) => acc + p.current, 0) ?? 0;
		},
		maxStat: ({ player, crop }, stat) => {
			const tool = player.getSelectedCropTool(crop) ?? getFakeItem(CROP_INFO[crop].startingTool);
			const progress = tool?.getProgress([stat], false) ?? [];
			return progress.reduce((acc, p) => acc + (p.stats?.[stat]?.max ?? 0), 0);
		},
		currentStat: ({ player, crop }, stat) => {
			const tool = player.getSelectedCropTool(crop);
			const progress = tool?.getProgress([stat], false) ?? [];
			return progress.reduce((acc, p) => acc + (p.stats?.[stat]?.current ?? 0), 0);
		},
		progress: ({ player, crop }, stats) => {
			const tool = player.getSelectedCropTool(crop);
			if (tool) return tool.getProgress(stats, false);

			const fake = getFakeItem<FarmingTool>(CROP_INFO[crop].startingTool);
			return fake?.getProgress(stats, true) ?? [];
		},
		info: ({ player, crop }) => {
			const tool = player.selectedTool?.crop === crop ? player.selectedTool : player.getSelectedCropTool(crop);

			const fake = !tool ? getFakeItem(CROP_INFO[crop].startingTool) : undefined;

			return {
				item: tool?.item,
				info: tool?.info,
				nextInfo: fake ? fake.info : tool?.getNextItemUpgrade()?.info,
				maxInfo: (fake ? fake : tool)?.getLastItemUpgrade()?.info,
			};
		},
	},
	{
		name: 'Exportable Crop',
		wiki: () => 'https://wiki.hypixel.net/Carrolyn',
		exists: ({ crop }) => CROP_INFO[crop].exportable === true,
		max: () => EXPORTABLE_CROP_FORTUNE,
		current: ({ player, crop }) => {
			return player.options.exportableCrops?.[crop] ? EXPORTABLE_CROP_FORTUNE : 0;
		},
		maxStat: ({ crop }, stat) => {
			if (stat === CROP_INFO[crop].fortuneType) {
				return EXPORTABLE_CROP_FORTUNE;
			}
			return 0;
		},
		currentStat: ({ player, crop }, stat) => {
			if (stat === CROP_INFO[crop].fortuneType) {
				return player.options.exportableCrops?.[crop] ? EXPORTABLE_CROP_FORTUNE : 0;
			}
			return 0;
		},
		upgrades: ({ player, crop }) => {
			if (player.options.exportableCrops?.[crop]) return [];

			return [
				{
					title: 'Exportable Crop',
					increase: EXPORTABLE_CROP_FORTUNE,
					stats: {
						[CROP_INFO[crop].fortuneType]: EXPORTABLE_CROP_FORTUNE,
					},
					action: UpgradeAction.Unlock,
					category: UpgradeCategory.Misc,
					wiki: 'https://wiki.hypixel.net/Carrolyn',
					cost: CROP_INFO[crop].exportableCost,
				},
			];
		},
	},
	{
		name: GARDEN_CROP_UPGRADES.name,
		exists: () => true,
		wiki: () => GARDEN_CROP_UPGRADES.wiki,
		current: ({ player, crop }) => {
			return (player.options.cropUpgrades?.[crop] ?? 0) * GARDEN_CROP_UPGRADES.fortunePerLevel;
		},
		max: ({ crop }) => {
			return GARDEN_CROP_UPGRADES.fortunePerLevel * GARDEN_CROP_UPGRADES.maxLevel;
		},
		maxStat: ({ crop }, stat) => {
			const fortuneType = CROP_INFO[crop].fortuneType;
			if (fortuneType === stat) {
				return GARDEN_CROP_UPGRADES.fortunePerLevel * GARDEN_CROP_UPGRADES.maxLevel;
			}
			return 0;
		},
		currentStat: ({ player, crop }, stat) => {
			const fortuneType = CROP_INFO[crop].fortuneType;
			if (fortuneType === stat) {
				return (player.options.cropUpgrades?.[crop] ?? 0) * GARDEN_CROP_UPGRADES.fortunePerLevel;
			}
			return 0;
		},
		upgrades: ({ player, crop }) => {
			const level = player.options.cropUpgrades?.[crop] ?? 0;
			if (level >= GARDEN_CROP_UPGRADES.maxLevel) return [];

			return [
				{
					title: GARDEN_CROP_UPGRADES.name,
					increase: GARDEN_CROP_UPGRADES.fortunePerLevel,
					stats: {
						[CROP_INFO[crop].fortuneType]: GARDEN_CROP_UPGRADES.fortunePerLevel,
					},
					action: UpgradeAction.Upgrade,
					wiki: GARDEN_CROP_UPGRADES.wiki,
					category: UpgradeCategory.Misc,
					cost: GARDEN_CROP_UPGRADES.upgradeCosts?.[level + 1],
					meta: {
						type: 'crop_upgrade',
						key: crop,
						value: level + 1,
					},
				},
			];
		},
	},
	{
		name: COCOA_FORTUNE_UPGRADE.name,
		exists: ({ crop }) => crop === Crop.CocoaBeans,
		wiki: () => COCOA_FORTUNE_UPGRADE.wiki,
		current: ({ player }) => {
			return (player.options.cocoaFortuneUpgrade ?? 0) * COCOA_FORTUNE_UPGRADE.fortunePerLevel;
		},
		max: () => {
			return COCOA_FORTUNE_UPGRADE.fortunePerLevel * COCOA_FORTUNE_UPGRADE.maxLevel;
		},
		maxStat: ({ crop }, stat) => {
			if (stat === Stat.CocoaBeanFortune) {
				return COCOA_FORTUNE_UPGRADE.fortunePerLevel * COCOA_FORTUNE_UPGRADE.maxLevel;
			}
			return 0;
		},
		currentStat: ({ player, crop }, stat) => {
			if (stat === Stat.CocoaBeanFortune) {
				return (player.options.cocoaFortuneUpgrade ?? 0) * COCOA_FORTUNE_UPGRADE.fortunePerLevel;
			}
			return 0;
		},
		upgrades: ({ player }) => {
			const level = player.options.cocoaFortuneUpgrade ?? 0;
			if (level >= COCOA_FORTUNE_UPGRADE.maxLevel) return [];

			return [
				{
					title: COCOA_FORTUNE_UPGRADE.name,
					increase: COCOA_FORTUNE_UPGRADE.fortunePerLevel,
					stats: {
						[Stat.CocoaBeanFortune]: COCOA_FORTUNE_UPGRADE.fortunePerLevel,
					},
					action: UpgradeAction.Upgrade,
					repeatable: COCOA_FORTUNE_UPGRADE.maxLevel - level,
					wiki: COCOA_FORTUNE_UPGRADE.wiki,
					category: UpgradeCategory.Misc,
					meta: {
						type: 'setting',
						key: 'cocoaFortuneUpgrade',
						value: level + 1,
					},
				},
			];
		},
	},
	{
		name: 'Helianthus Relic Family',
		exists: ({ player, crop }) => {
			const fortuneType = CROP_INFO[crop].fortuneType;
			const artifactFortune = FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.baseStats?.[fortuneType] ?? 0;

			// Crop is unsupported if Fermento Artifact lacks this fortune stat
			if (artifactFortune <= 0) return false;

			const active = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.family
			);

			// Helianthus Relic provides general fortune only
			if (active?.info.skyblockId === FARMING_ACCESSORIES_INFO.HELIANTHUS_RELIC?.skyblockId) return false;

			return true;
		},
		wiki: ({ player }) => {
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.HELIANTHUS_RELIC?.family
			);
			return highest?.info.wiki ?? FARMING_ACCESSORIES_INFO.CROPIE_TALISMAN?.wiki;
		},
		max: ({ crop }) => {
			const fortuneType = CROP_INFO[crop].fortuneType;
			const item = getFakeItem<FarmingAccessory>('HELIANTHUS_RELIC');
			return Math.max(item?.getStat(fortuneType) ?? 0, item?.getStat(Stat.FarmingFortune) ?? 0);
		},
		current: ({ player, crop }) => {
			const fortuneType = CROP_INFO[crop].fortuneType;
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.HELIANTHUS_RELIC?.family
			);
			if (!highest) return 0;
			return highest.getStat(fortuneType) || highest.getStat(Stat.FarmingFortune);
		},
		maxStat: ({ crop }, stat) => {
			const fortuneType = CROP_INFO[crop].fortuneType;
			const item = getFakeItem<FarmingAccessory>('HELIANTHUS_RELIC');
			if (fortuneType === stat) {
				return Math.max(item?.getStat(fortuneType) ?? 0, item?.getStat(Stat.FarmingFortune) ?? 0);
			}
			return 0;
		},
		currentStat: ({ player, crop }, stat) => {
			const fortuneType = CROP_INFO[crop].fortuneType;
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.HELIANTHUS_RELIC?.family
			);
			if (!highest) return 0;

			if (fortuneType === stat) {
				return highest.getStat(fortuneType) || highest.getStat(Stat.FarmingFortune);
			}
			return 0;
		},
		info: ({ player }) => {
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.HELIANTHUS_RELIC?.family
			);
			const first = !highest ? FARMING_ACCESSORIES_INFO.CROPIE_TALISMAN : undefined;
			return {
				item: highest?.item,
				info: highest?.info,
				nextInfo: first ?? highest?.getNextItemUpgrade()?.info,
				maxInfo: highest?.getLastItemUpgrade()?.info ?? FARMING_ACCESSORIES_INFO.HELIANTHUS_RELIC,
			};
		},
		upgrades: ({ player }) => {
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
		name: 'Personal Best',
		exists: () => true,
		wiki: () => 'https://wiki.hypixel.net/Anita#Personal_Bests',
		max: () => 100,
		current: ({ player, crop }) => {
			if (!player.options.personalBestsUnlocked) return 0;

			const personalBest =
				player.options.personalBests?.[getItemIdFromCrop(crop)] ??
				player.options.personalBests?.[getCropDisplayName(crop).replace(/ /g, '')];
			return fortuneFromPersonalBestContest(crop, personalBest ?? 0);
		},
		maxStat: ({ crop }, stat) => {
			if (stat === CROP_INFO[crop].fortuneType) return 100;
			return 0;
		},
		currentStat: ({ player, crop }, stat) => {
			if (stat === CROP_INFO[crop].fortuneType) {
				const personalBest =
					player.options.personalBests?.[getItemIdFromCrop(crop)] ??
					player.options.personalBests?.[getCropDisplayName(crop).replace(/ /g, '')];
				return fortuneFromPersonalBestContest(crop, personalBest ?? 0);
			}
			return 0;
		},
		upgrades: ({ player, crop }) => {
			if (player.options.personalBestsUnlocked) return [];

			const personalBest =
				player.options.personalBests?.[getItemIdFromCrop(crop)] ??
				player.options.personalBests?.[getCropDisplayName(crop).replace(/ /g, '')];
			const increase = fortuneFromPersonalBestContest(crop, personalBest ?? 0);

			return [
				{
					title: 'Personal Best Fortune',
					increase: increase,
					stats: {
						[CROP_INFO[crop].fortuneType]: increase,
					},
					action: UpgradeAction.Unlock,
					wiki: 'https://wiki.hypixel.net/Anita#Personal_Bests',
					category: UpgradeCategory.Anita,
					cost: {
						items: {
							JACOBS_TICKET: 64,
						},
						medals: {
							gold: 2,
						},
					},
					meta: {
						type: 'unlock',
						id: 'personal_best',
					},
				},
			];
		},
	},
	{
		name: 'Overdrive Chip',
		exists: ({ player, crop }) => {
			return !!(player.options.jacobContest?.enabled && player.options.jacobContest.crop === crop);
		},
		wiki: () => 'https://wiki.hypixel.net/Overdrive_Chip',
		max: () => 25,
		current: ({ player, crop }) => {
			if (!player.options.jacobContest?.enabled || player.options.jacobContest.crop !== crop) return 0;
			const level = getChipLevel(player.options.chips?.OVERDRIVE_GARDEN_CHIP);
			return 5 * level;
		},
		currentStat: ({ player, crop }, stat) => {
			if (!player.options.jacobContest?.enabled || player.options.jacobContest.crop !== crop) return 0;
			const fortuneType = CROP_INFO[crop].fortuneType;
			if (fortuneType === stat) {
				const level = getChipLevel(player.options.chips?.OVERDRIVE_GARDEN_CHIP);
				return 5 * level;
			}
			return 0;
		},
	},
];
