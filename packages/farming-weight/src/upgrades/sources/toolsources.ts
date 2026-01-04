import { CROP_INFO } from '../../constants/crops.js';
import { FARMING_ENCHANTS } from '../../constants/enchants.js';
import { Rarity, REFORGES, ReforgeTarget } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { type FortuneUpgrade, UpgradeAction, UpgradeCategory } from '../../constants/upgrades.js';
import type { FarmingTool } from '../../fortune/farmingtool.js';
import { GemRarity } from '../../fortune/item.js';
import { getMaxStatFromEnchant, getStatFromEnchant } from '../../util/enchants.js';
import { getPeridotFortune, getPeridotGemFortune } from '../../util/gems.js';
import { getUpgradeableEnchant } from '../enchantupgrades.js';
import { getUpgradeableGems } from '../upgrades.js';
import type { DynamicFortuneSource } from './dynamicfortunesources.js';

const CROP_FORTUNE_STATS = new Set(Object.values(CROP_INFO).map((c) => c.fortuneType));

export const TOOL_FORTUNE_SOURCES: DynamicFortuneSource<FarmingTool>[] = [
	{
		name: 'Tool Level',
		exists: () => true,
		max: () => 50 * 4,
		current: (tool) => tool.level * 4,
		maxStat: (tool, stat) => {
			for (const crop of tool.crops) {
				if (stat === CROP_INFO[crop]?.fortuneType) {
					return 50 * 4;
				}
			}
			return 0;
		},
		currentStat: (tool, stat) => {
			for (const crop of tool.crops) {
				if (stat === CROP_INFO[crop]?.fortuneType) {
					return tool.level * 4;
				}
			}
			return 0;
		},
		info: (tool) => ({
			item: tool.item,
			info: tool.info,
			nextInfo: tool.getNextItemUpgrade()?.info,
			maxInfo: tool.getLastItemUpgrade()?.info,
		}),
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
			// Find if there's a priority reforge that applies to this tool
			const priorityReforge = Object.values(REFORGES).find(
				(r) => r?.priority && tool.type && r.appliesTo.includes(tool.type)
			);
			const result: FortuneUpgrade[] = [];

			for (const reforge of Object.values(REFORGES)) {
				// Skip if the reforge doesn't apply to the item or is currently applied
				if (!reforge || !tool.type || !reforge.appliesTo.includes(tool.type) || reforge === tool.reforge) {
					continue;
				}

				// Skip non-priority reforges if there's a priority reforge available for this tool
				if (priorityReforge && reforge !== priorityReforge && !reforge.priority) continue;
				// Only suggest reforges with an explicit reforge stone
				if (!reforge.stone?.id) continue;

				const tier = reforge.tiers[tool.rarity];
				if (!tier || !tier.stats) continue;
				const nextPrimary = tier.stats?.[primaryStat] ?? 0;

				// Allow priority reforges even if they have less fortune
				if (!reforge.priority && nextPrimary <= currentPrimary) continue;

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
					wiki: reforge.wiki,
					// Optional if this is a priority reforge, and previous reforge is more fortune
					optional: reforge.priority && nextPrimary < currentPrimary,
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
			const peridotSlots = last?.gemSlots?.filter((s) => s.slot_type === 'PERIDOT').length ?? 0;
			const maxRarity = last?.maxRarity ?? Rarity.Common;
			return peridotSlots * getPeridotGemFortune(maxRarity, GemRarity.Perfect);
		},
		current: (upgradeable) => {
			return getPeridotFortune(upgradeable.rarity, upgradeable.item);
		},
		maxStat: (upgradeable, stat) => {
			if (stat !== Stat.FarmingFortune) return 0;
			const last = (upgradeable.getLastItemUpgrade() ?? upgradeable)?.info;
			const peridotSlots = last?.gemSlots?.filter((s) => s.slot_type === 'PERIDOT').length ?? 0;
			const maxRarity = last?.maxRarity ?? Rarity.Common;
			return peridotSlots * getPeridotGemFortune(maxRarity, GemRarity.Perfect);
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
		name: 'Axed Perk',
		wiki: () => 'https://wiki.hypixel.net/Essence#Forest_Essence_',
		exists: (tool) => tool.type === ReforgeTarget.Axe,
		max: (tool) => {
			const otherSources = TOOL_FORTUNE_SOURCES.filter((s) => s.name !== 'Axed Perk' && s.exists(tool));
			const maxFortune = otherSources.reduce((acc, source) => acc + source.max(tool), 0);
			return Math.max(0, maxFortune * 0.02);
		},
		current: (tool) => {
			if (!tool.hasAxedPerk()) return 0;
			const otherSources = TOOL_FORTUNE_SOURCES.filter((s) => s.name !== 'Axed Perk' && s.exists(tool));
			const fortune = otherSources.reduce((acc, source) => acc + source.current(tool), 0);
			return Math.max(0, fortune * 0.02);
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
					increase: tool.fortune * 0.02,
					stats: {
						[Stat.FarmingFortune]: tool.fortune * 0.02,
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
					onto: {
						name: tool.item.name,
						skyblockId: tool.item.skyblockId,
					},
				},
			] as FortuneUpgrade[];
		},
	},
	...Object.entries(FARMING_ENCHANTS).map(([id, enchant]) => enchantSourceBuilder(id, enchant)),
];

function enchantSourceBuilder(
	id: string,
	enchant: (typeof FARMING_ENCHANTS)[keyof typeof FARMING_ENCHANTS]
): DynamicFortuneSource<FarmingTool> {
	// Progress-only enchants (declared in the enchant definition)
	if (enchant.alwaysInclude) {
		return {
			name: enchant.name,
			wiki: () => enchant.wiki,
			alwaysInclude: true,
			exists: (tool) =>
				tool.type !== undefined &&
				enchant.appliesTo.includes(tool.type) &&
				(!enchant.cropSpecific || tool.crops.includes(enchant.cropSpecific)),
			max: () => 0,
			current: () => 0,
			maxStat: () => 0,
			currentStat: () => 0,
			progress: (tool) => {
				const level = tool.item.enchantments?.[id] ?? 0;
				return [
					{
						name: 'Level',
						current: level,
						max: enchant.maxLevel,
						ratio: Math.min(isNaN(level / enchant.maxLevel) ? 0 : level / enchant.maxLevel, 1),
					},
				];
			},
			upgrades: (tool) => getUpgradeableEnchant(tool, id, Stat.FarmingFortune, { includeWhenNoStatImpact: true }),
		};
	}

	return {
		name: enchant.name,
		wiki: () => enchant.wiki,
		exists: (tool) =>
			tool.type !== undefined &&
			enchant.appliesTo.includes(tool.type) &&
			(!enchant.cropSpecific || tool.crops.includes(enchant.cropSpecific)),
		max: (tool) => {
			// For multi-crop tools (e.g., Eclipse Hoe), take the best single-crop value to avoid double counting
			if (tool.crops.length > 1) {
				let best = 0;
				for (const crop of tool.crops) {
					best = Math.max(
						best,
						getMaxStatFromEnchant(enchant, CROP_INFO[crop].fortuneType, tool.options, crop)
					);
				}
				return best || getMaxStatFromEnchant(enchant, Stat.FarmingFortune, tool.options, tool.crops[0]);
			}

			let sum = 0;
			for (const crop of tool.crops) {
				sum += getMaxStatFromEnchant(enchant, CROP_INFO[crop].fortuneType, tool.options, crop);
			}
			return sum || getMaxStatFromEnchant(enchant, Stat.FarmingFortune, tool.options, tool.crops[0]);
		},
		current: (tool) => {
			if (tool.crops.length > 1) {
				let best = 0;
				for (const crop of tool.crops) {
					best = Math.max(
						best,
						getStatFromEnchant(
							tool.item.enchantments?.[id] ?? 0,
							enchant,
							CROP_INFO[crop].fortuneType,
							tool.options,
							crop
						)
					);
				}
				return (
					best ||
					getStatFromEnchant(
						tool.item.enchantments?.[id] ?? 0,
						enchant,
						Stat.FarmingFortune,
						tool.options,
						tool.crops[0]
					)
				);
			}

			let sum = 0;
			for (const crop of tool.crops) {
				sum += getStatFromEnchant(
					tool.item.enchantments?.[id] ?? 0,
					enchant,
					CROP_INFO[crop].fortuneType,
					tool.options,
					crop
				);
			}
			return (
				sum ||
				getStatFromEnchant(
					tool.item.enchantments?.[id] ?? 0,
					enchant,
					Stat.FarmingFortune,
					tool.options,
					tool.crops[0]
				)
			);
		},
		maxStat: (tool, stat) => {
			if (stat === Stat.FarmingFortune && tool.crops.length > 1) {
				let best = 0;
				for (const crop of tool.crops) {
					best = Math.max(best, getMaxStatFromEnchant(enchant, stat, tool.options, crop));
				}
				return best || getMaxStatFromEnchant(enchant, stat, tool.options, tool.crops[0]);
			}

			if (stat !== Stat.FarmingFortune && CROP_FORTUNE_STATS.has(stat)) {
				let best = 0;
				for (const crop of tool.crops) {
					if (CROP_INFO[crop]?.fortuneType !== stat) continue;
					best = Math.max(best, getMaxStatFromEnchant(enchant, stat, tool.options, crop));
				}
				return best || getMaxStatFromEnchant(enchant, stat, tool.options, tool.crops[0]);
			}

			let sum = 0;
			for (const crop of tool.crops) {
				sum += getMaxStatFromEnchant(enchant, stat, tool.options, crop);
			}
			return sum || getMaxStatFromEnchant(enchant, stat, tool.options, tool.crops[0]);
		},
		currentStat: (tool, stat) => {
			if (stat === Stat.FarmingFortune && tool.crops.length > 1) {
				let best = 0;
				for (const crop of tool.crops) {
					best = Math.max(
						best,
						getStatFromEnchant(tool.item.enchantments?.[id] ?? 0, enchant, stat, tool.options, crop)
					);
				}
				return (
					best ||
					getStatFromEnchant(tool.item.enchantments?.[id] ?? 0, enchant, stat, tool.options, tool.crops[0])
				);
			}

			if (stat !== Stat.FarmingFortune && CROP_FORTUNE_STATS.has(stat)) {
				let best = 0;
				for (const crop of tool.crops) {
					if (CROP_INFO[crop]?.fortuneType !== stat) continue;
					best = Math.max(
						best,
						getStatFromEnchant(tool.item.enchantments?.[id] ?? 0, enchant, stat, tool.options, crop)
					);
				}
				return (
					best ||
					getStatFromEnchant(tool.item.enchantments?.[id] ?? 0, enchant, stat, tool.options, tool.crops[0])
				);
			}

			let sum = 0;
			for (const crop of tool.crops) {
				sum += getStatFromEnchant(tool.item.enchantments?.[id] ?? 0, enchant, stat, tool.options, crop);
			}
			return (
				sum || getStatFromEnchant(tool.item.enchantments?.[id] ?? 0, enchant, stat, tool.options, tool.crops[0])
			);
		},
		upgrades: (tool, stats) => {
			const primaryStat = stats?.[0] ?? Stat.FarmingFortune;
			if (!CROP_FORTUNE_STATS.has(primaryStat)) {
				return getUpgradeableEnchant(tool, id, primaryStat);
			}

			const upgrades = [
				...getUpgradeableEnchant(tool, id, primaryStat),
				...getUpgradeableEnchant(tool, id, Stat.FarmingFortune),
			];

			const seen = new Set<string>();
			return upgrades.filter((u) => {
				const key = u.conflictKey ?? `${u.title}:${u.action}`;
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		},
	};
}
