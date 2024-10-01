import { Crop } from "../../constants/crops";
import { FARMING_ENCHANTS } from "../../constants/enchants";
import { Rarity, REFORGES, ReforgeTarget } from "../../constants/reforges";
import { getStatValue, Stat } from "../../constants/stats";
import { FarmingToolType } from "../../items/tools";
import { FortuneSourceProgress } from "../../constants/upgrades";
import { FarmingTool } from "../../fortune/farmingtool";
import { EliteItemDto, GemRarity } from "../../fortune/item";
import { UpgradeableInfo } from "../../fortune/upgradeable";
import { getFortuneFromEnchant, getMaxFortuneFromEnchant } from "../../util/enchants";
import { getPeridotFortune, getPeridotGemFortune } from "../../util/gems";

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
}

export const TOOL_FORTUNE_SOURCES: DynamicFortuneSource<FarmingTool>[] = [
	{
		name: 'Base Stats',
		exists: (tool) => {
			return (tool.getLastItemUpgrade() ?? tool)?.info?.baseStats?.[Stat.FarmingFortune] !== undefined
		},
		max: (tool) => {
			return (tool.getLastItemUpgrade() ?? tool)?.info?.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
		current: (tool) => {
			return tool.info.baseStats?.[Stat.FarmingFortune] ?? 0;
		}
	},
	{
		name: 'Base Stats',
		exists: (tool) => {
			const last = (tool.getLastItemUpgrade() ?? tool)?.info;
			return last?.stats?.[last.maxRarity]?.[Stat.FarmingFortune] !== undefined
		},
		max: (tool) => {
			const last = (tool.getLastItemUpgrade() ?? tool)?.info;
			return getStatValue(last?.stats?.[last.maxRarity]?.[Stat.FarmingFortune], tool.options);
		},
		current: (tool) => {
			return getStatValue(tool.info.stats?.[tool.rarity]?.[Stat.FarmingFortune], tool.options);
		}
	},
	{
		name: 'Item Ability',
		exists: (tool) => tool.info.computedStats !== undefined,
		// Temporary set to max of 170 for deadaalus axe
		max: () => 170,
		current: (tool) => {
			return tool.getCalculatedStats()[Stat.FarmingFortune] ?? 0;
		}
	},
	{
		name: 'Reforge Stats',
		wiki: () => REFORGES?.bountiful?.wiki,
		exists: (tool) => tool.type !== ReforgeTarget.Sword,
		max: (tool) => {
			const last = (tool.getLastItemUpgrade() ?? tool)?.info;
			return tool.reforge?.name === 'Blessed' 
				? REFORGES.blessed?.tiers[last.maxRarity]?.stats[Stat.FarmingFortune] ?? 0
				: REFORGES.bountiful?.tiers?.[last.maxRarity]?.stats[Stat.FarmingFortune] ?? 0;
		},
		current: (tool) => {
			return tool.reforgeStats?.stats?.[Stat.FarmingFortune] ?? 0;
		}
	},
	{
		name: 'Gemstone Slots',
		wiki: () => 'https://wiki.hypixel.net/Gemstone#Gemstone_Slots',
		exists: (tool) => {
			const last = (tool.getLastItemUpgrade() ?? tool)?.info;
			return last?.gemSlots?.peridot !== undefined
		},
		max: (tool) => {
			const last = (tool.getLastItemUpgrade() ?? tool)?.info;
			return (last?.gemSlots?.peridot ?? 0) * getPeridotGemFortune(last?.maxRarity ?? Rarity.Common, GemRarity.Perfect);
		},
		current: (tool) => {
			return getPeridotFortune(tool.rarity, tool.item);
		}
	},
	{
		name: 'Farming For Dummies',
		wiki: () => 'https://wiki.hypixel.net/Farming_For_Dummies',
		exists: (tool) => tool.type !== ReforgeTarget.Sword,
		max: () => 5,
		current: (tool) => {
			return +(tool.item.attributes?.farming_for_dummies_count ?? 0);
		}
	},
	{
		name: 'Logarithmic Counter',
		wiki: (tool) => tool.info.wiki,
		exists: (tool) => tool.info.type === FarmingToolType.MathematicalHoe,
		max: () => 16 * 7, // 10 billion counter
		current: (tool) => {
			const numberOfDigits = Math.max(Math.floor(Math.log10(Math.abs(tool.counter ?? 0))), 0) + 1;
			return Math.max((numberOfDigits - 4) * 16, 0);
		}
	},
	{
		name: 'Collection Analysis',
		wiki: (tool) => tool.info.wiki,
		exists: (tool) => tool.info.type === FarmingToolType.MathematicalHoe,
		max: () => 8 * 7, // 10 billion collection
		current: (tool) => tool.collAnalysis ?? 0
	},
	...Object.entries(FARMING_ENCHANTS)
		.map(([id, enchant]) => ({
			name: enchant.name,
			wiki: () => enchant.wiki,
			exists: (tool) => enchant.appliesTo.includes(tool.type) && (!enchant.cropSpecific || enchant.cropSpecific === tool.crop),
			max: (tool) => getMaxFortuneFromEnchant(enchant, tool.options, tool.crop),
			current: (tool) => getFortuneFromEnchant(tool.item.enchantments?.[id] ?? 0, enchant, tool.options, tool.crop)
		}) as DynamicFortuneSource<FarmingTool>)
];