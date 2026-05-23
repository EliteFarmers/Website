import {
	FARMING_ATTRIBUTE_SHARDS,
	getAttributeAmount,
	getShardLevel,
	getShardsForLevel,
	getShardsForNextLevel,
} from '../../constants/attributes.js';
import { FARMING_ENCHANTS } from '../../constants/enchants.js';
import { Rarity, REFORGES } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { type FortuneUpgrade, UpgradeAction, UpgradeCategory } from '../../constants/upgrades.js';
import { GemRarity } from '../../fortune/item.js';
import type { Vacuum } from '../../fortune/vacuum.js';
import { getMaxStatFromEnchant, getStatFromEnchant } from '../../util/enchants.js';
import { getPeridotFortune, getPeridotGemFortune } from '../../util/gems.js';
import { getUpgradeableEnchant } from '../enchantupgrades.js';
import { getCurrentReforgeEffectSummaries, getReforgeEffectSummaries, getUpgradeableGems } from '../upgrades.js';
import type { DynamicFortuneSource } from './dynamicfortunesources.js';

const VACUUM_STATS = [Stat.Damage, Stat.FarmingFortune, Stat.PestKillFortune] as const;
const INSECT_POWER_ATTRIBUTE = 'insect_power';
const INSECT_POWER_SHARD = FARMING_ATTRIBUTE_SHARDS[INSECT_POWER_ATTRIBUTE]!;

export const VACUUM_FORTUNE_SOURCES: DynamicFortuneSource<Vacuum>[] = [
	{
		name: 'Base Stats',
		exists: () => true,
		max: (vacuum) => {
			const last = (vacuum.getLastItemUpgrade() ?? vacuum)?.info;
			return VACUUM_STATS.reduce((sum, stat) => sum + (last.baseStats?.[stat] ?? 0), 0);
		},
		current: (vacuum) => VACUUM_STATS.reduce((sum, stat) => sum + (vacuum.info.baseStats?.[stat] ?? 0), 0),
		maxStat: (vacuum, stat) => {
			const last = (vacuum.getLastItemUpgrade() ?? vacuum)?.info;
			return last.baseStats?.[stat] ?? 0;
		},
		currentStat: (vacuum, stat) => vacuum.info.baseStats?.[stat] ?? 0,
		info: (vacuum) => ({
			item: vacuum.item,
			info: vacuum.info,
			nextInfo: vacuum.getNextItemUpgrade()?.info,
			maxInfo: vacuum.getLastItemUpgrade()?.info,
		}),
	},
	{
		name: 'Reforge Stats',
		wiki: () => REFORGES?.beady?.wiki ?? REFORGES?.buzzing?.wiki,
		exists: () => true,
		max: (vacuum) => {
			const last = (vacuum.getLastItemUpgrade() ?? vacuum)?.info;
			let best = 0;
			for (const reforge of Object.values(REFORGES)) {
				if (!reforge?.appliesTo.includes(vacuum.type)) continue;
				best = Math.max(best, reforge.tiers[last.maxRarity]?.stats?.[Stat.PestKillFortune] ?? 0);
			}
			return best;
		},
		current: (vacuum) => vacuum.reforgeStats?.stats?.[Stat.PestKillFortune] ?? 0,
		maxStat: (vacuum, stat) => {
			const last = (vacuum.getLastItemUpgrade() ?? vacuum)?.info;
			const current = vacuum.reforgeStats?.stats?.[stat] ?? 0;
			let best = 0;
			for (const reforge of Object.values(REFORGES)) {
				if (!reforge?.appliesTo.includes(vacuum.type) || !reforge.stone?.id) continue;
				best = Math.max(best, reforge.tiers[last.maxRarity]?.stats?.[stat] ?? 0);
			}
			return Math.max(best, current);
		},
		currentStat: (vacuum, stat) => vacuum.reforgeStats?.stats?.[stat] ?? 0,
		effects: getCurrentReforgeEffectSummaries,
		upgrades: (vacuum, stats) => {
			const requestedStats = stats && stats.length > 0 ? stats : [Stat.PestKillFortune];
			const currentStats = vacuum.reforgeStats?.stats ?? {};
			const result: FortuneUpgrade[] = [];

			for (const [reforgeId, reforge] of Object.entries(REFORGES)) {
				if (!reforge?.appliesTo.includes(vacuum.type) || reforge === vacuum.reforge || !reforge.stone?.id) {
					continue;
				}

				const tier = reforge.tiers[vacuum.rarity];
				if (!tier?.stats) continue;

				const effects = getReforgeEffectSummaries(vacuum, reforgeId, requestedStats);
				if (
					!requestedStats.some((stat) => (tier.stats?.[stat] ?? 0) > (currentStats?.[stat] ?? 0)) &&
					effects.length === 0
				) {
					continue;
				}

				const deltaStats: Partial<Record<Stat, number>> = {};
				for (const stat of Object.values(Stat)) {
					const diff = (tier.stats?.[stat] ?? 0) - (currentStats?.[stat] ?? 0);
					if (diff !== 0) deltaStats[stat] = diff;
				}

				result.push({
					title: 'Reforge to ' + reforge.name,
					increase: deltaStats[requestedStats[0] ?? Stat.PestKillFortune] ?? 0,
					stats: deltaStats,
					effects: effects.length > 0 ? effects : undefined,
					action: UpgradeAction.Apply,
					category: UpgradeCategory.Reforge,
					conflictKey: 'reforge',
					wiki: reforge.wiki,
					onto: {
						name: vacuum.item.name,
						skyblockId: vacuum.item.skyblockId,
					},
					meta: {
						itemUuid: vacuum.item.uuid ?? undefined,
						type: 'reforge',
						id: reforge.name.toLowerCase().replaceAll(' ', '_'),
					},
					cost: {
						items: {
							[reforge.stone.id]: 1,
						},
						applyCost: tier.cost ? { coins: tier.cost } : undefined,
					},
				});
			}

			return result;
		},
	},
	{
		name: 'Gemstone Slots',
		wiki: () => 'https://w.elitesb.gg/Gemstone_Slot',
		exists: (vacuum) => {
			const last = (vacuum.getLastItemUpgrade() ?? vacuum)?.info;
			return last?.gemSlots?.some((s) => s.slot_type === 'PERIDOT') !== undefined;
		},
		max: (vacuum) => {
			const last = (vacuum.getLastItemUpgrade() ?? vacuum)?.info;
			const peridotSlots = last?.gemSlots?.filter((s) => s.slot_type === 'PERIDOT').length ?? 0;
			const maxRarity = last?.maxRarity ?? Rarity.Common;
			return peridotSlots * getPeridotGemFortune(maxRarity, GemRarity.Perfect);
		},
		current: (vacuum) => getPeridotFortune(vacuum.rarity, vacuum.item),
		maxStat: (vacuum, stat) => {
			if (stat !== Stat.FarmingFortune) return 0;
			const last = (vacuum.getLastItemUpgrade() ?? vacuum)?.info;
			const peridotSlots = last?.gemSlots?.filter((s) => s.slot_type === 'PERIDOT').length ?? 0;
			const maxRarity = last?.maxRarity ?? Rarity.Common;
			return peridotSlots * getPeridotGemFortune(maxRarity, GemRarity.Perfect);
		},
		currentStat: (vacuum, stat) =>
			stat === Stat.FarmingFortune ? getPeridotFortune(vacuum.rarity, vacuum.item) : 0,
		upgrades: getUpgradeableGems,
	},
	{
		name: 'Farming For Dummies',
		wiki: () => 'https://w.elitesb.gg/Farming_For_Dummies',
		exists: () => true,
		max: () => 5,
		current: (vacuum) => vacuum.farmingForDummies,
		maxStat: (_vacuum, stat) => (stat === Stat.FarmingFortune ? 5 : 0),
		currentStat: (vacuum, stat) => (stat === Stat.FarmingFortune ? vacuum.farmingForDummies : 0),
		upgrades: (vacuum) => {
			const count = vacuum.farmingForDummies;
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
					wiki: 'https://w.elitesb.gg/Farming_For_Dummies',
					cost: {
						items: {
							FARMING_FOR_DUMMIES: 1,
						},
					},
					onto: {
						name: vacuum.item.name,
						skyblockId: vacuum.item.skyblockId,
					},
					meta: {
						itemUuid: vacuum.item.uuid ?? undefined,
						type: 'item',
						id: 'farming_for_dummies_count',
						value: count + 1,
					},
				},
			];
		},
	},
	{
		name: "Bookworm's Favorite Book",
		wiki: () => 'https://w.elitesb.gg/Bookworm%27s_Favorite_Book',
		exists: () => true,
		max: () => 50,
		current: (vacuum) => vacuum.bookwormBooks * 10,
		maxStat: (_vacuum, stat) => (stat === Stat.Damage ? 50 : 0),
		currentStat: (vacuum, stat) => (stat === Stat.Damage ? vacuum.bookwormBooks * 10 : 0),
		upgrades: (vacuum, stats) => {
			if (stats && stats.length > 0 && !stats.includes(Stat.Damage)) return [];
			const count = vacuum.bookwormBooks;
			if (count < 0 || count >= 5) return [];

			return [
				{
					title: "Bookworm's Favorite Book",
					increase: 0,
					stats: {
						[Stat.Damage]: 10,
					},
					action: UpgradeAction.Apply,
					category: UpgradeCategory.Item,
					conflictKey: 'bookworm_books',
					repeatable: 5 - count,
					wiki: 'https://w.elitesb.gg/Bookworm%27s_Favorite_Book',
					cost: {
						items: {
							BOOKWORM_BOOK: 1,
						},
					},
					onto: {
						name: vacuum.item.name,
						skyblockId: vacuum.item.skyblockId,
					},
					meta: {
						itemUuid: vacuum.item.uuid ?? undefined,
						type: 'item',
						id: 'bookworm_books',
						value: count + 1,
					},
				},
			];
		},
	},
	{
		name: INSECT_POWER_SHARD.name,
		wiki: () => INSECT_POWER_SHARD.wiki,
		exists: () => true,
		max: (vacuum) => vacuum.getInsectPowerDamageBonus(10),
		current: (vacuum) => vacuum.getInsectPowerDamageBonus(),
		maxStat: (vacuum, stat) => (stat === Stat.Damage ? vacuum.getInsectPowerDamageBonus(10) : 0),
		currentStat: (vacuum, stat) => (stat === Stat.Damage ? vacuum.getInsectPowerDamageBonus() : 0),
		upgrades: (vacuum, stats) => {
			if (stats && stats.length > 0 && !stats.includes(Stat.Damage)) return [];

			const amount = getAttributeAmount(vacuum.options?.attributes, INSECT_POWER_ATTRIBUTE);
			const nextCost = getShardsForNextLevel(Rarity.Uncommon, amount);
			if (!nextCost) return [];

			const currentLevel = getShardLevel(Rarity.Uncommon, amount);
			const nextLevel = currentLevel + 1;
			const damage = vacuum.getDamageWithInsectPowerLevel(nextLevel) - vacuum.getStat(Stat.Damage);

			return [
				{
					title: INSECT_POWER_SHARD.name.replace('Shard', nextLevel.toString()),
					increase: 0,
					stats: {
						[Stat.Damage]: damage,
					},
					action: UpgradeAction.LevelUp,
					category: UpgradeCategory.Attribute,
					conflictKey: INSECT_POWER_ATTRIBUTE,
					wiki: INSECT_POWER_SHARD.wiki,
					cost: {
						items: {
							[INSECT_POWER_SHARD.skyblockId]: nextCost,
						},
					},
					onto: {
						name: vacuum.item.name,
						skyblockId: vacuum.item.skyblockId,
					},
					meta: {
						itemUuid: vacuum.item.uuid ?? undefined,
						type: 'attribute',
						key: INSECT_POWER_ATTRIBUTE,
						value: getShardsForLevel(Rarity.Uncommon, nextLevel),
					},
				},
			];
		},
	},
	...Object.entries(FARMING_ENCHANTS).map(([id, enchant]) => ({
		name: enchant.name,
		wiki: () => enchant.wiki,
		exists: (vacuum: Vacuum) => enchant.appliesTo.includes(vacuum.type),
		max: () => getMaxStatFromEnchant(enchant, Stat.PestKillFortune),
		current: (vacuum: Vacuum) =>
			getStatFromEnchant(vacuum.item.enchantments?.[id] ?? 0, enchant, Stat.PestKillFortune, vacuum.options),
		maxStat: (_vacuum: Vacuum, stat: Stat) => getMaxStatFromEnchant(enchant, stat),
		currentStat: (vacuum: Vacuum, stat: Stat) =>
			getStatFromEnchant(vacuum.item.enchantments?.[id] ?? 0, enchant, stat, vacuum.options),
		upgrades: (vacuum: Vacuum, stats?: Stat[]) => {
			const requestedStats = stats && stats.length > 0 ? stats : [Stat.PestKillFortune];
			const upgrades: FortuneUpgrade[] = [];
			for (const stat of requestedStats) {
				upgrades.push(...getUpgradeableEnchant(vacuum, id, stat));
			}

			const seen = new Set<string>();
			return upgrades.filter((upgrade) => {
				const key = upgrade.conflictKey ?? `${upgrade.title}:${upgrade.action}`;
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		},
	})),
];
