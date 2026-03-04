import { FARMING_ENCHANTS } from '../../constants/enchants.js';
import { compareRarity, Rarity, REFORGES, ReforgeTarget } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import type { FarmingArmor } from '../../fortune/farmingarmor.js';
import type { FarmingEquipment } from '../../fortune/farmingequipment.js';
import { GemRarity } from '../../fortune/item.js';
import { getMaxStatFromEnchant, getStatFromEnchant } from '../../util/enchants.js';
import { getPeridotFortune, getPeridotGemFortune } from '../../util/gems.js';
import { getUpgradeableEnchant } from '../enchantupgrades.js';
import { getUpgradeableGems, getUpgradeableReforges } from '../upgrades.js';
import type { DynamicFortuneSource } from './dynamicfortunesources.js';

export const GEAR_FORTUNE_SOURCES: DynamicFortuneSource<FarmingArmor | FarmingEquipment>[] = [
	{
		name: 'Base Stats',
		exists: (gear) => {
			return Object.keys((gear.getLastItemUpgrade() ?? gear)?.info?.baseStats ?? {}).length > 0;
		},
		max: (gear) => {
			return (gear.getLastItemUpgrade() ?? gear)?.info?.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
		current: (gear) => {
			return gear.info.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
		maxStat: (gear, stat) => {
			return (gear.getLastItemUpgrade() ?? gear)?.info?.baseStats?.[stat] ?? 0;
		},
		currentStat: (gear, stat) => {
			return gear.info.baseStats?.[stat] ?? 0;
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
			const current = gear.reforgeStats?.stats?.[Stat.FarmingFortune] ?? 0;
			const max =
				gear.type === ReforgeTarget.Equipment
					? (REFORGES.rooted?.tiers[maxRarity]?.stats[Stat.FarmingFortune] ?? 0)
					: (REFORGES.mossy?.tiers[maxRarity]?.stats[Stat.FarmingFortune] ?? 0);
			// If an item is recombobulated beyond its base max rarity, keep max >= current.
			return Math.max(max, current);
		},
		current: (gear) => {
			return gear.reforgeStats?.stats?.[Stat.FarmingFortune] ?? 0;
		},
		maxStat: (gear, stat) => {
			const maxRarity = (gear.getLastItemUpgrade()?.info.maxRarity ?? gear.info.maxRarity) as Rarity;
			const current = gear.reforgeStats?.stats?.[stat] ?? 0;

			let best = 0;
			for (const reforge of Object.values(REFORGES)) {
				if (!reforge || !reforge.appliesTo.includes(gear.type)) continue;
				// Keep "max" aligned with what we can suggest/cost (stone-based).
				if (!reforge.stone?.id) continue;
				const tier = reforge.tiers?.[maxRarity];
				const val = tier?.stats?.[stat] ?? 0;
				if (val > best) best = val;
			}

			return Math.max(best, current);
		},
		currentStat: (gear, stat) => {
			return gear.reforgeStats?.stats?.[stat] ?? 0;
		},
		upgrades: getUpgradeableReforges,
	},
	{
		name: 'Gemstone Slots',
		wiki: () => 'https://wiki.hypixel.net/Gemstone#Gemstone_Slots',
		exists: (upgradeable) => {
			const lastInfo = (upgradeable.getLastItemUpgrade() ?? upgradeable)?.info;
			const currentInfo = upgradeable.info;
			return (
				lastInfo?.gemSlots?.some((s) => s.slot_type === 'PERIDOT') === true ||
				currentInfo?.gemSlots?.some((s) => s.slot_type === 'PERIDOT') === true
			);
		},
		max: (upgradeable) => {
			const lastInfo = (upgradeable.getLastItemUpgrade() ?? upgradeable)?.info;
			const currentInfo = upgradeable.info;
			const maxRarity = (lastInfo?.maxRarity ?? currentInfo?.maxRarity ?? Rarity.Common) as Rarity;
			const rarity = (
				compareRarity(upgradeable.rarity, maxRarity) > 0 ? upgradeable.rarity : maxRarity
			) as Rarity;
			const peridotSlots = Math.max(
				lastInfo?.gemSlots?.filter((s) => s.slot_type === 'PERIDOT').length ?? 0,
				currentInfo?.gemSlots?.filter((s) => s.slot_type === 'PERIDOT').length ?? 0
			);
			return peridotSlots * getPeridotGemFortune(rarity, GemRarity.Perfect);
		},
		current: (upgradeable) => {
			return getPeridotFortune(upgradeable.rarity, upgradeable.item);
		},
		maxStat: (upgradeable, stat) => {
			if (stat !== Stat.FarmingFortune) return 0;
			const lastInfo = (upgradeable.getLastItemUpgrade() ?? upgradeable)?.info;
			const currentInfo = upgradeable.info;
			const maxRarity = (lastInfo?.maxRarity ?? currentInfo?.maxRarity ?? Rarity.Common) as Rarity;
			const rarity = (
				compareRarity(upgradeable.rarity, maxRarity) > 0 ? upgradeable.rarity : maxRarity
			) as Rarity;
			const peridotSlots = Math.max(
				lastInfo?.gemSlots?.filter((s) => s.slot_type === 'PERIDOT').length ?? 0,
				currentInfo?.gemSlots?.filter((s) => s.slot_type === 'PERIDOT').length ?? 0
			);
			return peridotSlots * getPeridotGemFortune(rarity, GemRarity.Perfect);
		},
		currentStat: (upgradeable, stat) => {
			return stat === Stat.FarmingFortune ? getPeridotFortune(upgradeable.rarity, upgradeable.item) : 0;
		},
		upgrades: getUpgradeableGems,
	},
	{
		name: 'Visitors Served Bonus',
		wiki: (gear) => gear.info.wiki,
		exists: (gear) => gear.type === ReforgeTarget.Equipment && gear.info.family === 'LOTUS',
		max: (_gear) => 22.5,
		current: (gear) => {
			return (gear as FarmingEquipment).getPieceBonus();
		},
		maxStat: (_gear, stat) => (stat === Stat.FarmingFortune ? 22.5 : 0),
		currentStat: (gear, stat) => (stat === Stat.FarmingFortune ? (gear as FarmingEquipment).getPieceBonus() : 0),
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
		maxStat: (gear, stat) => {
			const last = (gear.getLastItemUpgrade() ?? gear)?.info;
			if (!('perLevelStats' in last) || last.perLevelStats?.skill !== Skill.Farming) return 0;
			return (last.perLevelStats?.stats?.[stat] ?? 0) * 60;
		},
		currentStat: (gear, stat) => {
			return (gear.info.perLevelStats?.stats?.[stat] ?? 0) * (gear.options?.farmingLevel ?? 0);
		},
	},
	...Object.entries(FARMING_ENCHANTS ?? {})
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
					max: (gear) => getMaxStatFromEnchant(enchant, Stat.FarmingFortune, gear.options),
					current: (gear) =>
						getStatFromEnchant(
							gear.item.enchantments?.[id] ?? 0,
							enchant,
							Stat.FarmingFortune,
							gear.options
						),
					maxStat: (gear, stat) => getMaxStatFromEnchant(enchant, stat, gear.options),
					currentStat: (gear, stat) =>
						getStatFromEnchant(gear.item.enchantments?.[id] ?? 0, enchant, stat, gear.options),
					upgrades: (gear, stats) => getUpgradeableEnchant(gear, id, stats?.[0] ?? Stat.FarmingFortune),
				}) as DynamicFortuneSource<FarmingArmor | FarmingEquipment>
		),
];
