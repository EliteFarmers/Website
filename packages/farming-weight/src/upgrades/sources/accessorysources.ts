import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import type { FarmingAccessory } from '../../fortune/farmingaccessory.js';
import { GemRarity } from '../../fortune/item.js';
import { getPeridotFortune, getPeridotGemFortune } from '../../util/gems.js';
import { getUpgradeableGems } from '../upgrades.js';
import type { DynamicFortuneSource } from './dynamicfortunesources.js';

export const ACCESSORY_FORTUNE_SOURCES: DynamicFortuneSource<FarmingAccessory>[] = [
	{
		name: 'Base Stats',
		wiki: (accessory) => accessory.info.wiki,
		exists: (accessory) => {
			return (accessory.getLastItemUpgrade() ?? accessory)?.info?.baseStats?.[Stat.FarmingFortune] !== undefined;
		},
		max: (accessory) => {
			return (accessory.getLastItemUpgrade() ?? accessory)?.info?.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
		current: (accessory) => {
			return accessory.info.baseStats?.[Stat.FarmingFortune] ?? 0;
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
				0.5 *
				(last?.gemSlots?.filter((s) => s.slot_type === 'PERIDOT').length ?? 0) *
				getPeridotGemFortune(last?.maxRarity ?? Rarity.Common, GemRarity.Perfect)
			);
		},
		current: (upgradeable) => {
			return 0.5 * getPeridotFortune(upgradeable.rarity, upgradeable.item);
		},
		upgrades: getUpgradeableGems,
	},
];
