import { CROP_INFO, Crop, EXPORTABLE_CROP_FORTUNE } from '../../constants/crops.js';
import { fortuneFromPersonalBestContest } from '../../constants/personalbests.js';
import { COCOA_FORTUNE_UPGRADE, GARDEN_CROP_UPGRADES } from '../../constants/specific.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeAction, UpgradeCategory } from '../../constants/upgrades.js';
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
			return progress.reduce(
				(acc, p) => acc + (p.stats?.[stat]?.max ?? (stat === Stat.FarmingFortune ? p.max : 0)),
				0
			);
		},
		currentStat: ({ player, crop }, stat) => {
			const tool = player.getSelectedCropTool(crop);
			const progress = tool?.getProgress([stat], false) ?? [];
			return progress.reduce(
				(acc, p) => acc + (p.stats?.[stat]?.current ?? (stat === Stat.FarmingFortune ? p.current : 0)),
				0
			);
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
		upgrades: ({ player, crop }) => {
			if (player.options.exportableCrops?.[crop]) return [];

			return [
				{
					title: 'Exportable Crop',
					increase: EXPORTABLE_CROP_FORTUNE,
					stats: {
						[Stat.FarmingFortune]: EXPORTABLE_CROP_FORTUNE,
					},
					action: UpgradeAction.Unlock,
					category: UpgradeCategory.Misc,
					api: false,
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
		max: () => GARDEN_CROP_UPGRADES.fortunePerLevel * GARDEN_CROP_UPGRADES.maxLevel,
		current: ({ player, crop }) => {
			return (player.options.cropUpgrades?.[crop] ?? 0) * GARDEN_CROP_UPGRADES.fortunePerLevel;
		},
		upgrades: ({ player, crop }) => {
			const level = player.options.cropUpgrades?.[crop] ?? 0;
			if (level >= GARDEN_CROP_UPGRADES.maxLevel) return [];

			return [
				{
					title: GARDEN_CROP_UPGRADES.name,
					increase: GARDEN_CROP_UPGRADES.fortunePerLevel,
					stats: {
						[Stat.FarmingFortune]: GARDEN_CROP_UPGRADES.fortunePerLevel,
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
		max: () => COCOA_FORTUNE_UPGRADE.fortunePerLevel * COCOA_FORTUNE_UPGRADE.maxLevel,
		current: ({ player }) => {
			return (player.options.cocoaFortuneUpgrade ?? 0) * COCOA_FORTUNE_UPGRADE.fortunePerLevel;
		},
		upgrades: ({ player }) => {
			const level = player.options.cocoaFortuneUpgrade ?? 0;
			if (level >= COCOA_FORTUNE_UPGRADE.maxLevel) return [];

			return [
				{
					title: COCOA_FORTUNE_UPGRADE.name,
					increase: COCOA_FORTUNE_UPGRADE.fortunePerLevel,
					stats: {
						[Stat.FarmingFortune]: COCOA_FORTUNE_UPGRADE.fortunePerLevel,
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
		name: 'Fermento Artifact Family',
		exists: ({ player, crop }) => {
			const active = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.family
			);
			if (!active) return true;

			if (active.info.crops && active.info.crops.includes(crop)) {
				return true;
			}

			return false;
		},
		wiki: ({ player }) => {
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.family
			);
			return highest?.info.wiki ?? FARMING_ACCESSORIES_INFO.CROPIE_TALISMAN?.wiki;
		},
		max: () => FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.baseStats?.[Stat.FarmingFortune] ?? 0,
		current: ({ player, crop }) => {
			const highest = player.activeAccessories.find(
				(a) => a.info.family === FARMING_ACCESSORIES_INFO.FERMENTO_ARTIFACT?.family
			);
			if (!highest) return 0;

			if (highest.info.crops && !highest.info.crops.includes(crop)) {
				return 0;
			}

			return highest.info.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
		info: ({ player }) => {
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
						[Stat.FarmingFortune]: increase,
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
];
