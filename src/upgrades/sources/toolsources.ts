import { FARMING_ENCHANTS } from '../../constants/enchants.js';
import { Rarity, REFORGES, ReforgeTarget } from '../../constants/reforges.js';
import { getStatValue, Stat } from '../../constants/stats.js';
import { type FortuneUpgrade, UpgradeAction, UpgradeCategory } from '../../constants/upgrades.js';
import type { FarmingTool } from '../../fortune/farmingtool.js';
import { GemRarity } from '../../fortune/item.js';
import { FarmingToolType } from '../../items/tools.js';
import { getMaxStatFromEnchant, getStatFromEnchant } from '../../util/enchants.js';
import { getPeridotFortune, getPeridotGemFortune } from '../../util/gems.js';
import { getUpgradeableEnchant } from '../enchantupgrades.js';
import { getUpgradeableGems } from '../upgrades.js';
import type { DynamicFortuneSource } from './dynamicfortunesources.js';

export const TOOL_FORTUNE_SOURCES: DynamicFortuneSource<FarmingTool>[] = [
	{
		name: 'Base Stats',
		exists: (tool) => {
			return Object.keys((tool.getLastItemUpgrade() ?? tool)?.info?.baseStats ?? {}).length > 0;
		},
		max: (tool) => {
			return (tool.getLastItemUpgrade() ?? tool)?.info?.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
		current: (tool) => {
			return tool.info.baseStats?.[Stat.FarmingFortune] ?? 0;
		},
		maxStat: (tool, stat) => (tool.getLastItemUpgrade() ?? tool)?.info?.baseStats?.[stat] ?? 0,
		currentStat: (tool, stat) => tool.info.baseStats?.[stat] ?? 0,
	},
	{
		name: 'Base Stats',
		exists: (tool) => {
			const last = (tool.getLastItemUpgrade() ?? tool)?.info;
			return last?.stats !== undefined;
		},
		max: (tool) => {
			const last = (tool.getLastItemUpgrade() ?? tool)?.info;
			return getStatValue(last?.stats?.[last.maxRarity]?.[Stat.FarmingFortune], tool.options);
		},
		current: (tool) => {
			return getStatValue(tool.info.stats?.[tool.rarity]?.[Stat.FarmingFortune], tool.options);
		},
		maxStat: (tool, stat) => {
			const last = (tool.getLastItemUpgrade() ?? tool)?.info;
			return getStatValue(last?.stats?.[last.maxRarity]?.[stat], tool.options);
		},
		currentStat: (tool, stat) => {
			return getStatValue(tool.info.stats?.[tool.rarity]?.[stat], tool.options);
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
		maxStat: (_tool, stat) => (stat === Stat.FarmingFortune ? 170 : 0),
		currentStat: (tool, stat) => tool.getCalculatedStats()[stat] ?? 0,
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
		maxStat: (tool, stat) => {
			const last = (tool.getLastItemUpgrade() ?? tool)?.info;
			if (tool.reforge?.name === 'Bountiful')
				return REFORGES.bountiful?.tiers[last.maxRarity]?.stats?.[stat] ?? 0;
			return REFORGES.blessed?.tiers?.[last.maxRarity]?.stats?.[stat] ?? 0;
		},
		currentStat: (tool, stat) => tool.reforgeStats?.stats?.[stat] ?? 0,
		upgrades: (tool, stats) => {
			const primaryStat = stats?.[0] ?? Stat.FarmingFortune;
			const currentStats = tool.reforgeStats?.stats ?? {};
			const currentPrimary = currentStats?.[primaryStat] ?? 0;
			const result: FortuneUpgrade[] = [];

			for (const reforge of Object.values(REFORGES)) {
				// Skip if the reforge doesn't apply to the item or is currently applied
				if (!reforge || !tool.type || !reforge.appliesTo.includes(tool.type) || reforge === tool.reforge) {
					continue;
				}
				// Only suggest reforges with an explicit reforge stone (keeps output consistent and costable)
				if (!reforge.stone?.id) continue;

				const tier = reforge.tiers[tool.rarity];
				if (!tier || !tier.stats) continue;
				const nextPrimary = tier.stats?.[primaryStat] ?? 0;
				if (nextPrimary <= currentPrimary) continue;

				const deltaStats: Partial<Record<Stat, number>> = {};
				for (const s of Object.values(Stat)) {
					const before = currentStats?.[s] ?? 0;
					const after = tier.stats?.[s] ?? 0;
					const diff = after - before;
					if (diff !== 0) deltaStats[s] = diff;
				}
				const increase = deltaStats[Stat.FarmingFortune] ?? 0;

				result.push({
					title: 'Reforge to ' + reforge.name,
					increase,
					stats: deltaStats,
					action: UpgradeAction.Apply,
					category: UpgradeCategory.Reforge,
					conflictKey: 'reforge',
					optional:
						(reforge === REFORGES.bountiful && tool.reforge === REFORGES.blessed) ||
						(reforge === REFORGES.blessed && tool.reforge === REFORGES.bountiful),
					wiki: reforge.wiki,
					onto: {
						name: tool.item.name,
						skyblockId: tool.item.skyblockId,
					},
					meta: {
						itemUuid: tool.item.uuid ?? undefined,
						type: 'reforge',
						id: reforge.name.toLowerCase().replaceAll(' ', '_'),
					},
					cost: reforge.stone?.id
						? {
								items: {
									[reforge.stone.id]: 1,
								},
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
		maxStat: (upgradeable, stat) => {
			if (stat !== Stat.FarmingFortune) return 0;
			const last = (upgradeable.getLastItemUpgrade() ?? upgradeable)?.info;
			return (
				(last?.gemSlots?.filter((s) => s.slot_type === 'PERIDOT').length ?? 0) *
				getPeridotGemFortune(last?.maxRarity ?? Rarity.Common, GemRarity.Perfect)
			);
		},
		currentStat: (upgradeable, stat) =>
			stat === Stat.FarmingFortune ? getPeridotFortune(upgradeable.rarity, upgradeable.item) : 0,
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
		maxStat: (_tool, stat) => (stat === Stat.FarmingFortune ? 5 : 0),
		currentStat: (tool, stat) =>
			stat === Stat.FarmingFortune ? +(tool.item.attributes?.farming_for_dummies_count ?? 0) : 0,
		upgrades: (tool) => {
			const count = +(tool.item.attributes?.farming_for_dummies_count ?? 0);
			if (count < 0 || count >= 5) return [];

			return [
				{
					title: 'Farming For Dummies',
					increase: 1,
					stats: {
						[Stat.FarmingFortune]: 1,
					},
					action: UpgradeAction.Apply,
					category: UpgradeCategory.Item,
					conflictKey: 'farming_for_dummies',
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
					meta: {
						itemUuid: tool.item.uuid ?? undefined,
						type: 'item',
						id: 'farming_for_dummies_count',
						value: count + 1,
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
		maxStat: (_tool, stat) => (stat === Stat.FarmingFortune ? 16 * 7 : 0),
		currentStat: (tool, stat) => {
			if (stat !== Stat.FarmingFortune) return 0;
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
		maxStat: (_tool, stat) => (stat === Stat.FarmingFortune ? 8 * 7 : 0),
		currentStat: (tool, stat) => (stat === Stat.FarmingFortune ? (tool.collAnalysis ?? 0) : 0),
	},
	...Object.entries(FARMING_ENCHANTS).map(([id, enchant]) => enchantSourceBuilder(id, enchant)),
	{
		name: 'Axed Perk',
		wiki: () => 'https://wiki.hypixel.net/Essence#Forest_Essence_',
		exists: (tool) => tool.info.type === ReforgeTarget.Axe || tool.info.type === FarmingToolType.Dicer,
		max: (tool) => {
			const otherSources = TOOL_FORTUNE_SOURCES.filter((s) => s.name !== 'Axed Perk' && s.exists(tool));

			const maxFortune = otherSources.reduce((acc, source) => acc + source.max(tool), 0);
			return Math.max(0, maxFortune * 0.02); // 2% of the other sources
		},
		current: (tool) => {
			if (!tool.hasAxedPerk()) return 0;
			const otherSources = TOOL_FORTUNE_SOURCES.filter((s) => s.name !== 'Axed Perk' && s.exists(tool));

			const fortune = otherSources.reduce((acc, source) => acc + source.current(tool), 0);
			return Math.max(0, fortune * 0.02); // 2% of the other sources
		},
		maxStat: (tool, stat) => {
			if (stat !== Stat.FarmingFortune) return 0;
			const otherSources = TOOL_FORTUNE_SOURCES.filter((s) => s.name !== 'Axed Perk' && s.exists(tool));
			const maxFortune = otherSources.reduce((acc, source) => acc + source.max(tool), 0);
			return Math.max(0, maxFortune * 0.02);
		},
		currentStat: (tool, stat) => {
			if (stat !== Stat.FarmingFortune) return 0;
			if (!tool.hasAxedPerk()) return 0;
			const otherSources = TOOL_FORTUNE_SOURCES.filter((s) => s.name !== 'Axed Perk' && s.exists(tool));
			const fortune = otherSources.reduce((acc, source) => acc + source.current(tool), 0);
			return Math.max(0, fortune * 0.02);
		},
		upgrades: (tool) => {
			if (tool.hasAxedPerk()) return [];

			return [
				{
					title: 'Axed Perk',
					increase: tool.getFortune() * 0.02,
					stats: {
						[Stat.FarmingFortune]: tool.getFortune() * 0.02,
					},
					action: UpgradeAction.Unlock,
					category: UpgradeCategory.Misc,
					conflictKey: 'axed_perk',
					wiki: 'https://wiki.hypixel.net/Essence#Forest_Essence_',
					cost: {
						items: {
							ESSENCE_FOREST: 10_000,
						},
					},
				},
			] as FortuneUpgrade[];
		},
	},
];

function enchantSourceBuilder(
	id: string,
	enchant: (typeof FARMING_ENCHANTS)[keyof typeof FARMING_ENCHANTS]
): DynamicFortuneSource<FarmingTool> {
	return {
		name: enchant.name,
		wiki: () => enchant.wiki,
		exists: (tool) =>
			tool.type !== undefined &&
			enchant.appliesTo.includes(tool.type) &&
			(!enchant.cropSpecific || enchant.cropSpecific === tool.crop),
		max: (tool) => getMaxStatFromEnchant(enchant, Stat.FarmingFortune, tool.options, tool.crop),
		current: (tool) =>
			getStatFromEnchant(
				tool.item.enchantments?.[id] ?? 0,
				enchant,
				Stat.FarmingFortune,
				tool.options,
				tool.crop
			),
		maxStat: (tool, stat) => getMaxStatFromEnchant(enchant, stat, tool.options, tool.crop),
		currentStat: (tool, stat) =>
			getStatFromEnchant(tool.item.enchantments?.[id] ?? 0, enchant, stat, tool.options, tool.crop),
		upgrades: (tool, stats) => getUpgradeableEnchant(tool, id, stats?.[0] ?? Stat.FarmingFortune),
	};
}
