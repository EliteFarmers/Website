import { FARMING_ENCHANTS } from '../../constants/enchants.js';
import { REFORGES, Rarity, ReforgeTarget } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import type { FarmingArmor } from '../../fortune/farmingarmor.js';
import { FarmingEquipment } from '../../fortune/farmingequipment.js';
import { GemRarity } from '../../fortune/item.js';
import { getFortuneFromEnchant, getMaxFortuneFromEnchant } from '../../util/enchants.js';
import { getPeridotFortune, getPeridotGemFortune } from '../../util/gems.js';
import { getUpgradeableEnchant, getUpgradeableGems, getUpgradeableReforges } from '../upgrades.js';
import { DynamicFortuneSource } from './toolsources.js';

export const GEAR_FORTUNE_SOURCES: DynamicFortuneSource<FarmingArmor | FarmingEquipment>[] = [
	{
		name: 'Base Stats',
		exists: (gear) => {
			return (gear.getLastItemUpgrade() ?? gear)?.info?.baseStats?.[Stat.FarmingFortune] !== undefined;
		},
		max: (gear) => {
			return (gear.getLastItemUpgrade() ?? gear)?.info?.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
		current: (gear) => {
			return gear.info.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
	},
	{
		name: 'Reforge Stats',
		exists: () => true,
		wiki: (gear) => {
			return gear.type === ReforgeTarget.Equipment ? REFORGES?.rooted?.wiki : REFORGES?.mossy?.wiki;
		},
		max: (gear) => {
			const maxRarity = (gear.getLastItemUpgrade()?.info.maxRarity ?? gear.info.maxRarity) as Rarity;
			return gear.type === ReforgeTarget.Equipment
				? (REFORGES.rooted?.tiers[maxRarity]?.stats[Stat.FarmingFortune] ?? 0)
				: (REFORGES.mossy?.tiers[maxRarity]?.stats[Stat.FarmingFortune] ?? 0);
		},
		current: (gear) => {
			return gear.reforgeStats?.stats?.[Stat.FarmingFortune] ?? 0;
		},
		upgrades: getUpgradeableReforges,
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
		name: 'Salesperson Ability',
		wiki: (gear) => gear.info.wiki,
		exists: (gear) => gear.type === ReforgeTarget.Equipment && gear.info.family === 'LOTUS',
		max: () => 15,
		current: (gear) => {
			return (gear as FarmingEquipment).getPieceBonus();
		},
	},
	{
		name: 'Farming Level',
		wiki: (gear) => gear.info.wiki,
		exists: (gear) => gear.type === ReforgeTarget.Armor && gear.info.perLevelStats?.skill === Skill.Farming,
		max: (gear) => {
			const last = (gear.getLastItemUpgrade() ?? gear)?.info;
			return 'perLevelStats' in last && last.perLevelStats?.skill === Skill.Farming
				? (last?.perLevelStats?.stats[Stat.FarmingFortune] ?? 0) * 60
				: (gear.info?.perLevelStats?.stats[Stat.FarmingFortune] ?? 0) * 60;
		},
		current: (gear) => {
			return (gear.info.perLevelStats?.stats[Stat.FarmingFortune] ?? 0) * (gear.options?.farmingLevel ?? 0);
		},
	},
	...Object.entries(FARMING_ENCHANTS)
		.filter(
			([, enchant]) =>
				enchant.appliesTo.includes(ReforgeTarget.Armor) || enchant.appliesTo.includes(ReforgeTarget.Equipment)
		)
		.map(
			([id, enchant]) =>
				({
					name: enchant.name,
					wiki: () => enchant.wiki,
					exists: (gear) => enchant.appliesTo.includes(gear.type),
					max: (gear) => getMaxFortuneFromEnchant(enchant, gear.options),
					current: (gear) => getFortuneFromEnchant(gear.item.enchantments?.[id] ?? 0, enchant, gear.options),
					upgrades: (gear) => getUpgradeableEnchant(gear, id),
				}) as DynamicFortuneSource<FarmingArmor | FarmingEquipment>
		),
];
