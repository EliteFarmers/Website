import type { FarmingPlayer } from '../player/player.js';
import type { DynamicFortuneSource } from '../upgrades/sources/dynamicfortunesources.js';
import type { CalculateCropDetailedDropsOptions, DetailedDropsResult } from '../util/ratecalc.js';
import { Crop } from './crops.js';
import { Rarity } from './reforges.js';
import { MATCHING_SPECIAL_CROP } from './specialcrops.js';
import { getStatValue, Stat, type StatsRecord } from './stats.js';

type ShardId = keyof typeof FARMING_ATTRIBUTE_SHARDS;

export type FarmingAttributes = Record<ShardId | string, number>;

export interface FarmingAttributeShard {
	name: string;
	skyblockId: string;
	rarity: Rarity;
	wiki: string;
	effect: FarmingAttributeShardEffect;
	stats?: StatsRecord<unknown, FarmingPlayer | CalculateCropDetailedDropsOptions>;
	perLevelStats?: StatsRecord<unknown, FarmingPlayer | CalculateCropDetailedDropsOptions>;
	active?: DynamicFortuneSource<FarmingPlayer | CalculateCropDetailedDropsOptions>['active'];
	ratesModifier?: (current: DetailedDropsResult, options: CalculateCropDetailedDropsOptions) => DetailedDropsResult;
}

export type FarmingAttributeShardEffect = 'none' | 'rates' | 'fortune' | 'wisdom';

export const FARMING_ATTRIBUTE_SHARDS: Record<string, FarmingAttributeShard> = {
	wart_eater: {
		name: 'Warty Bug Shard',
		skyblockId: 'SHARD_WARTYBUG',
		rarity: Rarity.Legendary,
		effect: 'rates',
		wiki: 'https://wiki.hypixel.net/Warty_Bug',
		ratesModifier: (current, options) => {
			if (options.crop !== Crop.NetherWart) return current;

			const level = getShardLevel(Rarity.Legendary, getAttributeAmount(options.attributes, 'wart_eater'));
			if (level <= 0) return current;

			const wartyChance = 0.00005 * level;
			const wartyDrops = current.blocksBroken * wartyChance;

			current.pendingRngItems ??= {};
			current.pendingRngItems['WARTY'] = (current.pendingRngItems['WARTY'] ?? 0) + wartyDrops;
			current.rareItemBonusBreakdown['Warty Bug Shard (Base)'] = 0;
			return current;
		},
	},
	garden_wisdom: {
		name: 'Dragonfly Shard',
		skyblockId: 'SHARD_DRAGONFLY',
		rarity: Rarity.Epic,
		effect: 'wisdom',
		wiki: 'https://wiki.hypixel.net/Dragonfly',
		perLevelStats: {
			[Stat.FarmingWisdom]: {
				value: 0.5,
			},
		},
	},
	solar_power: {
		name: 'Firefly Shard',
		skyblockId: 'SHARD_FIREFLY',
		rarity: Rarity.Epic,
		effect: 'fortune',
		wiki: 'https://wiki.hypixel.net/Firefly',
		active: (options) => {
			const firefly = getAttributeAmount(options.attributes, 'solar_power');
			const lunarMoth = getAttributeAmount(options.attributes, 'lunar_power');
			const forceFirefly = 'options' in options && options.options.selectedCrop === Crop.Sunflower;
			const forceLunarMoth = 'options' in options && options.options.selectedCrop === Crop.Moonflower;

			if (forceFirefly) {
				return {
					active: true,
					reason: 'Firefly Shard is active because you have selected Sunflower!',
				};
			}

			if (forceLunarMoth) {
				return {
					active: false,
					reason: 'Firefly Shard is disabled because you have selected Moonflower!',
					fortune: 5 * getShardLevel(Rarity.Epic, lunarMoth),
				};
			}

			if (lunarMoth >= firefly) {
				return {
					active: false,
					reason: 'Lunar Moth shard is at a higher or equal level, using it instead.',
					fortune: 5 * getShardLevel(Rarity.Epic, lunarMoth),
				};
			}

			return {
				active: true,
				reason: 'This shard is only active during the day! Set your garden to day time to use it.',
			};
		},
		perLevelStats: {
			[Stat.FarmingFortune]: {
				value: 5,
			},
		},
	},
	lunar_power: {
		name: 'Lunar Moth Shard',
		skyblockId: 'SHARD_LUNAR_MOTH',
		rarity: Rarity.Epic,
		effect: 'fortune',
		wiki: 'https://wiki.hypixel.net/Lunar_Moth',
		active: (options) => {
			const firefly = getAttributeAmount(options.attributes, 'solar_power');
			const lunarMoth = getAttributeAmount(options.attributes, 'lunar_power');
			const forceFirefly = 'options' in options && options.options.selectedCrop === Crop.Sunflower;
			const forceLunarMoth = 'options' in options && options.options.selectedCrop === Crop.Moonflower;

			if (forceLunarMoth) {
				return {
					active: true,
					reason: 'Lunar Moth Shard is active because you have selected Moonflower!',
				};
			}

			if (forceFirefly) {
				return {
					active: false,
					reason: 'Lunar Moth Shard is disabled because you have selected Sunflower!',
					fortune: 5 * getShardLevel(Rarity.Epic, firefly),
				};
			}

			if (firefly > lunarMoth) {
				return {
					active: false,
					reason: 'Firefly shard is at a higher level, using it instead.',
					fortune: 5 * getShardLevel(Rarity.Epic, firefly),
				};
			}

			return {
				active: true,
				reason: 'This shard is only active during the night! Set your garden to night time to use it.',
			};
		},
		perLevelStats: {
			[Stat.FarmingFortune]: {
				value: 5,
			},
		},
	},
	pretty_clothes: {
		// 1% more copper from visitors per level
		name: 'Ladybug Shard',
		skyblockId: 'SHARD_LADYBUG',
		rarity: Rarity.Rare,
		effect: 'none',
		wiki: 'https://wiki.hypixel.net/Ladybug',
	},
	crop_bug: {
		name: 'Cropeetle Shard',
		skyblockId: 'SHARD_CROPEETLE',
		rarity: Rarity.Rare,
		effect: 'rates',
		wiki: 'https://wiki.hypixel.net/Cropeetle',
		ratesModifier: (current, options) => {
			const level = getShardLevel(Rarity.Rare, getAttributeAmount(options.attributes, 'crop_bug'));
			if (level <= 0) return current;

			const specialCrop = MATCHING_SPECIAL_CROP[options.crop];
			if (!specialCrop) return current;

			const bonus = 0.02 * level;
			current.specialCropBonus += bonus;
			current.specialCropBonusBreakdown['Cropeetle Shard'] = bonus;
			return current;
		},
	},
	fancy_visit: {
		// 1% chance for rare or higher visitor per level
		name: 'Invisibug Shard',
		skyblockId: 'SHARD_INVISIBUG',
		rarity: Rarity.Rare,
		effect: 'none',
		wiki: 'https://wiki.hypixel.net/Invisibug',
	},
	infiltration: {
		name: 'Termite Shard',
		skyblockId: 'SHARD_TERMITE',
		rarity: Rarity.Uncommon,
		effect: 'fortune',
		wiki: 'https://wiki.hypixel.net/Termite',
		active: (options) => {
			const opt = 'options' in options ? options.options : options;
			if (!opt.infestedPlotProbability || opt.infestedPlotProbability <= 0) {
				return {
					active: false,
					reason: 'Termite shard is only active on infested plots.',
					fortune: 3 * getShardLevel(Rarity.Uncommon, getAttributeAmount(options.attributes, 'infiltration')),
				};
			}
			return {
				active: true,
				reason: 'This shard is only active on infested plots!',
			};
		},
		perLevelStats: {
			[Stat.FarmingFortune]: {
				value: 3,
			},
		},
	},
	insect_power: {
		// 5% vacuum damage per level
		name: 'Praying Mantis Shard',
		skyblockId: 'SHARD_PRAYING_MANTIS',
		rarity: Rarity.Uncommon,
		effect: 'none',
		wiki: 'https://wiki.hypixel.net/Praying_Mantis',
	},
	pest_luck: {
		// 2% chance for rare pest drops per level
		name: 'Pest Shard',
		skyblockId: 'SHARD_PEST',
		rarity: Rarity.Uncommon,
		effect: 'none',
		wiki: 'https://wiki.hypixel.net/Pest',
	},
	visitor_bait: {
		// Garden visitors 1% faster per level
		name: 'Mudworm Shard',
		skyblockId: 'SHARD_MUDWORM',
		rarity: Rarity.Common,
		effect: 'none',
		wiki: 'https://wiki.hypixel.net/Mudworm',
	},
	ultimate_dna: {
		// 1 farming fortune per level
		name: 'Galaxy Fish Shard',
		skyblockId: 'SHARD_GALAXY_FISH',
		rarity: Rarity.Legendary,
		effect: 'fortune',
		wiki: 'https://wiki.hypixel.net/Galaxy_Fish',
		perLevelStats: {
			[Stat.FarmingFortune]: {
				value: 1,
			},
			[Stat.MiningFortune]: {
				value: 1,
			},
			[Stat.ForagingFortune]: {
				value: 1,
			},
		},
	},
};

const ATTRIBUTE_SHARD_ID_BY_SKYBLOCK_ID = Object.fromEntries(
	Object.entries(FARMING_ATTRIBUTE_SHARDS).map(([id, shard]) => [shard.skyblockId.toUpperCase(), id as ShardId])
) as Record<string, ShardId>;

export function normalizeAttributeId(id: string): ShardId | undefined {
	const normalized = id.trim().toLowerCase();
	if (normalized in FARMING_ATTRIBUTE_SHARDS) {
		return normalized as ShardId;
	}
	return ATTRIBUTE_SHARD_ID_BY_SKYBLOCK_ID[id.trim().toUpperCase()];
}

export function getAttributeAmount(attributes: Record<string, number> | undefined, id: ShardId): number {
	if (!attributes) return 0;

	const direct = attributes[id];
	if (direct !== undefined && direct !== null) return direct;

	const legacyId = FARMING_ATTRIBUTE_SHARDS[id]?.skyblockId;
	if (!legacyId) return 0;

	const legacy = attributes[legacyId];
	return legacy ?? 0;
}

export function normalizeAttributes(attributes?: Record<string, number>): Record<string, number> | undefined {
	if (!attributes) return undefined;

	const normalized: Record<string, number> = {};
	for (const [id, amount] of Object.entries(attributes)) {
		const shardId = normalizeAttributeId(id) ?? id;
		normalized[shardId] = amount;
	}

	return normalized;
}

export const ATTRIBUTE_SHARD_LEVELING: Partial<Record<Rarity, number[]>> = {
	[Rarity.Common]: [1, 3, 5, 6, 7, 8, 10, 14, 18, 24],
	[Rarity.Uncommon]: [1, 2, 3, 4, 5, 6, 7, 8, 12, 16],
	[Rarity.Rare]: [1, 2, 3, 3, 4, 4, 5, 6, 8, 12],
	[Rarity.Epic]: [1, 1, 2, 2, 3, 3, 4, 4, 5, 7],
	[Rarity.Legendary]: [1, 1, 1, 2, 2, 2, 3, 3, 4, 5],
};

export function getShardLevel(rarity: Rarity, amount?: number | null): number {
	if (!amount || amount <= 0) return 0;

	const levels = ATTRIBUTE_SHARD_LEVELING[rarity];
	if (!levels) return 0;

	for (let i = 0; i < levels.length; i++) {
		const threshold = levels[i] as number;
		if (amount < threshold) {
			return i;
		}
		amount -= threshold;
	}

	return levels.length;
}

export function getShardsForLevel(rarity: Rarity, level: number): number {
	const levels = ATTRIBUTE_SHARD_LEVELING[rarity];
	if (!levels || level <= 0) return 0;

	return levels.slice(0, level).reduce((sum, current) => sum + current, 0);
}

export function getShardsForNextLevel(rarity: Rarity, amount: number): number {
	const levels = ATTRIBUTE_SHARD_LEVELING[rarity];
	if (!levels || amount < 0) return 0;

	for (let i = 0; i < levels.length; i++) {
		const threshold = levels[i] as number;
		if (amount < threshold) {
			return threshold - amount;
		}
		amount -= threshold;
	}

	return 0;
}

export function getShardFortune(
	shard: FarmingAttributeShard,
	player: FarmingPlayer | CalculateCropDetailedDropsOptions,
	level?: number
): number {
	return getShardStat(shard, player, Stat.FarmingFortune, level);
}

export function getShardStat(
	shard: FarmingAttributeShard,
	player: FarmingPlayer | CalculateCropDetailedDropsOptions,
	stat: Stat,
	level?: number
): number {
	const shardId = normalizeAttributeId(shard.skyblockId);
	const amount =
		shardId !== undefined
			? getAttributeAmount(player.attributes, shardId)
			: (player.attributes?.[shard.skyblockId] ?? 0);
	level ??= getShardLevel(shard.rarity, amount);
	if (level <= 0) return 0;

	const active = shard.active?.(player);
	if (active && !active.active) {
		return 0;
	}

	const stats = getStatValue<unknown, FarmingPlayer | CalculateCropDetailedDropsOptions>(shard.stats?.[stat], player);
	const perLevel = getStatValue<unknown, FarmingPlayer | CalculateCropDetailedDropsOptions>(
		shard.perLevelStats?.[stat],
		player
	);

	return stats + level * perLevel;
}
