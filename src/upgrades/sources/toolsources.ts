import { Crop } from '../../constants/crops.js';
import { FARMING_ENCHANTS } from '../../constants/enchants.js';
import { REFORGES, Rarity, ReforgeTarget } from '../../constants/reforges.js';
import { Stat, getStatValue } from '../../constants/stats.js';
import { FortuneSourceProgress, FortuneUpgrade, UpgradeAction, UpgradeCategory } from '../../constants/upgrades.js';
import { FarmingTool } from '../../fortune/farmingtool.js';
import { EliteItemDto, GemRarity } from '../../fortune/item.js';
import { UpgradeableInfo } from '../../fortune/upgradeable.js';
import { FarmingToolType } from '../../items/tools.js';
import { getFortuneFromEnchant, getMaxFortuneFromEnchant } from '../../util/enchants.js';
import { getPeridotFortune, getPeridotGemFortune } from '../../util/gems.js';
import { getUpgradeableEnchant, getUpgradeableGems } from '../upgrades.js';

export interface DynamicFortuneSource<T> {
	name: string;
	crop?: Crop;
	api?: boolean;
	wiki?: (source: T) => string | undefined;
	exists: (source: T) => boolean;
	max: (source: T) => number;
	current: (source: T) => number;
	progress?: (source: T) => FortuneSourceProgress[];
	info?: (source: T) => {
		item?: EliteItemDto;
		info?: UpgradeableInfo;
		nextInfo?: UpgradeableInfo;
		maxInfo?: UpgradeableInfo;
	};
	upgrades?: (source: T) => FortuneUpgrade[];
}

export const TOOL_FORTUNE_SOURCES: DynamicFortuneSource<FarmingTool>[] = [
	{
		name: 'Base Stats',
		exists: (tool) => {
			return (tool.getLastItemUpgrade() ?? tool)?.info?.baseStats?.[Stat.FarmingFortune] !== undefined;
		},
		max: (tool) => {
			return (tool.getLastItemUpgrade() ?? tool)?.info?.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
		current: (tool) => {
			return tool.info.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
	},
	{
		name: 'Base Stats',
		exists: (tool) => {
			const last = (tool.getLastItemUpgrade() ?? tool)?.info;
			return last?.stats?.[last.maxRarity]?.[Stat.FarmingFortune] !== undefined;
		},
		max: (tool) => {
			const last = (tool.getLastItemUpgrade() ?? tool)?.info;
			return getStatValue(last?.stats?.[last.maxRarity]?.[Stat.FarmingFortune], tool.options);
		},
		current: (tool) => {
			return getStatValue(tool.info.stats?.[tool.rarity]?.[Stat.FarmingFortune], tool.options);
		},
	},
	{
		name: 'Item Ability',
		exists: (tool) => tool.info.computedStats !== undefined,
		// Temporary set to max of 170 for deadaalus axe
		max: () => 170,
		current: (tool) => {
			return tool.getCalculatedStats()[Stat.FarmingFortune] ?? 0;
		},
	},
	{
		name: 'Reforge Stats',
		wiki: () => REFORGES?.bountiful?.wiki,
		exists: (tool) => tool.type !== ReforgeTarget.Sword,
		max: (tool) => {
			const last = (tool.getLastItemUpgrade() ?? tool)?.info;
			return tool.reforge?.name === 'Bountiful'
				? (REFORGES.bountiful?.tiers[last.maxRarity]?.stats[Stat.FarmingFortune] ?? 0)
				: (REFORGES.blessed?.tiers?.[last.maxRarity]?.stats[Stat.FarmingFortune] ?? 0);
		},
		current: (tool) => {
			return tool.reforgeStats?.stats?.[Stat.FarmingFortune] ?? 0;
		},
		upgrades: (tool) => {
			const currentFortune = tool.reforgeStats?.stats?.[Stat.FarmingFortune] ?? 0;
			const result: FortuneUpgrade[] = [];

			for (const reforge of Object.values(REFORGES)) {
				// Skip if the reforge doesn't apply to the item or is currently applied
				if (!reforge || !reforge.appliesTo.includes(tool.type) || reforge === tool.reforge) return result;

				const tier = reforge.tiers[tool.rarity];
				if (!tier || !tier.stats?.[Stat.FarmingFortune]) continue;

				const reforgeFortune = tier?.stats[Stat.FarmingFortune];
				// Skip if the reforge doesn't increase farming fortune and is not bountiful
				// Bountiful is considered to be the best reforge, but it gives less farming fortune than blessed
				if (reforgeFortune <= currentFortune && reforge !== REFORGES.bountiful) continue;

				result.push({
					title: 'Reforge to ' + reforge.name,
					increase: (reforgeFortune ?? 0) - currentFortune,
					action: UpgradeAction.Apply,
					category: UpgradeCategory.Reforge,
					optional:
						(reforge === REFORGES.bountiful && tool.reforge === REFORGES.blessed) ||
						(reforge === REFORGES.blessed && tool.reforge === REFORGES.bountiful),
					wiki: reforge.wiki,
					onto: {
						name: tool.item.name,
						skyblockId: tool.item.skyblockId,
					},
					cost: reforge.stone?.id
						? {
								items: {
									[reforge.stone.id]: 1,
								},
								copper: reforge.stone.copper ?? undefined,
								applyCost: tier?.cost
									? {
											coins: tier?.cost,
										}
									: undefined,
							}
						: undefined,
				});
			}

			return result;
		},
	},
	{
		name: 'Gemstone Slots',
		wiki: () => 'https://wiki.hypixel.net/Gemstone#Gemstone_Slots',
		exists: (upgradeable) => {
			const last = (upgradeable.getLastItemUpgrade() ?? upgradeable)?.info;
			return last?.gemSlots?.some((s) => s.slot_type === 'PERIDOT') !== undefined;
		},
		max: (upgradeable) => {
			const last = (upgradeable.getLastItemUpgrade() ?? upgradeable)?.info;
			return (
				(last?.gemSlots?.filter((s) => s.slot_type === 'PERIDOT').length ?? 0) *
				getPeridotGemFortune(last?.maxRarity ?? Rarity.Common, GemRarity.Perfect)
			);
		},
		current: (upgradeable) => {
			return getPeridotFortune(upgradeable.rarity, upgradeable.item);
		},
		upgrades: getUpgradeableGems,
	},
	{
		name: 'Farming For Dummies',
		wiki: () => 'https://wiki.hypixel.net/Farming_For_Dummies',
		exists: (tool) => tool.type !== ReforgeTarget.Sword,
		max: () => 5,
		current: (tool) => {
			return +(tool.item.attributes?.farming_for_dummies_count ?? 0);
		},
		upgrades: (tool) => {
			const count = +(tool.item.attributes?.farming_for_dummies_count ?? 0);
			if (count <= 0 || count >= 5) return [];

			return [
				{
					title: 'Farming For Dummies',
					increase: 1,
					action: UpgradeAction.Apply,
					category: UpgradeCategory.Item,
					repeatable: 5 - count,
					wiki: 'https://wiki.hypixel.net/Farming_For_Dummies',
					cost: {
						items: {
							FARMING_FOR_DUMMIES: 1,
						},
					},
					onto: {
						name: tool.item.name,
						skyblockId: tool.item.skyblockId,
					},
				},
			] as FortuneUpgrade[];
		},
	},
	{
		name: 'Logarithmic Counter',
		wiki: (tool) => tool.info.wiki,
		exists: (tool) => tool.info.type === FarmingToolType.MathematicalHoe,
		max: () => 16 * 7, // 10 billion counter
		current: (tool) => {
			const numberOfDigits = Math.max(Math.floor(Math.log10(Math.abs(tool.counter ?? 0))), 0) + 1;
			return Math.max((numberOfDigits - 4) * 16, 0);
		},
	},
	{
		name: 'Collection Analysis',
		wiki: (tool) => tool.info.wiki,
		exists: (tool) => tool.info.type === FarmingToolType.MathematicalHoe,
		max: () => 8 * 7, // 10 billion collection
		current: (tool) => tool.collAnalysis ?? 0,
	},
	...Object.entries(FARMING_ENCHANTS).map(([id, enchant]) => enchantSourceBuilder(id, enchant)),
];

function enchantSourceBuilder(
	id: string,
	enchant: (typeof FARMING_ENCHANTS)[keyof typeof FARMING_ENCHANTS]
): DynamicFortuneSource<FarmingTool> {
	return {
		name: enchant.name,
		wiki: () => enchant.wiki,
		exists: (tool) =>
			enchant.appliesTo.includes(tool.type) && (!enchant.cropSpecific || enchant.cropSpecific === tool.crop),
		max: (tool) => getMaxFortuneFromEnchant(enchant, tool.options, tool.crop),
		current: (tool) => getFortuneFromEnchant(tool.item.enchantments?.[id] ?? 0, enchant, tool.options, tool.crop),
		upgrades: (tool) => getUpgradeableEnchant(tool, id),
	};
}
