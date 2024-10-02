import { Rarity } from "../../constants/reforges.js";
import { Stat } from "../../constants/stats.js";
import { FarmingAccessory } from "../../fortune/farmingaccessory.js";
import { GemRarity } from "../../fortune/item.js";
import { getPeridotFortune, getPeridotGemFortune } from "../../util/gems.js";
import { DynamicFortuneSource } from "./toolsources.js";

export const ACCESSORY_FORTUNE_SOURCES: DynamicFortuneSource<FarmingAccessory>[] = [
	{
		name: 'Base Stats',
		wiki: (accessory) => accessory.info.wiki, 
		exists: (accessory) => {
			return (accessory.getLastItemUpgrade() ?? accessory)?.info?.baseStats?.[Stat.FarmingFortune] !== undefined
		},
		max: (accessory) => {
			return (accessory.getLastItemUpgrade() ?? accessory)?.info?.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
		current: (accessory) => {
			return accessory.info.baseStats?.[Stat.FarmingFortune] ?? 0;
		}
	},
	{
		name: 'Gemstone Slots',
		wiki: () => 'https://wiki.hypixel.net/Gemstone#Gemstone_Slots', 
		exists: (accessory) => {
			const last = (accessory.getLastItemUpgrade() ?? accessory)?.info;
			return last?.gemSlots?.peridot !== undefined
		},
		max: (accessory) => {
			const last = (accessory.getLastItemUpgrade() ?? accessory)?.info;
			return 0.5 * (last?.gemSlots?.peridot ?? 0) * getPeridotGemFortune(last?.maxRarity ?? Rarity.Common, GemRarity.Perfect);
		},
		current: (accessory) => {
			return 0.5 * getPeridotFortune(accessory.rarity, accessory.item);
		}
	}
];