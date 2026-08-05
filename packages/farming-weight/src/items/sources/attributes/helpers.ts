import { getShardsForLevel } from '../../../constants/attribute-leveling.js';
import type { Crop } from '../../../constants/crops.js';
import { Stat } from '../../../constants/stats.js';
import { buildEffectEnvironment } from '../../../effects/environment.js';
import type { FarmingPlayer } from '../../../player/player.js';
import type { PlayerOptions } from '../../../player/playeroptions.js';
import type { FortuneSourceActiveState } from '../base.js';
import type { FarmingAttributeShard } from './attribute-shard.js';
import { FARMING_ATTRIBUTE_SHARDS, type FarmingAttributeShardId } from './registry.js';

export type FarmingAttributes = Record<string, number>;

export interface FarmingAttributeShardContext {
	attributes?: FarmingAttributes | Record<string, number>;
	infestedPlotProbability?: number;
	crop?: Crop;
}

export type FarmingAttributeShardSourceContext = FarmingPlayer | FarmingAttributeShardContext;

const ATTRIBUTE_SHARD_ID_BY_SKYBLOCK_ID = Object.fromEntries(
	Object.entries(FARMING_ATTRIBUTE_SHARDS).map(([id, shard]) => [
		shard.skyblockId.toUpperCase(),
		id as FarmingAttributeShardId,
	])
) as Record<string, FarmingAttributeShardId>;

export function normalizeAttributeId(id: string): FarmingAttributeShardId | undefined {
	const normalized = id.trim().toLowerCase();
	if (normalized in FARMING_ATTRIBUTE_SHARDS) return normalized as FarmingAttributeShardId;
	return ATTRIBUTE_SHARD_ID_BY_SKYBLOCK_ID[id.trim().toUpperCase()];
}

export function getAttributeAmount(
	attributes: Record<string, number> | undefined,
	id: FarmingAttributeShardId
): number {
	if (!attributes) return 0;
	const direct = attributes[id];
	if (direct !== undefined && direct !== null) return direct;
	return attributes[FARMING_ATTRIBUTE_SHARDS[id].skyblockId] ?? 0;
}

export function normalizeAttributes(attributes?: Record<string, number>): Record<string, number> | undefined {
	if (!attributes) return undefined;
	const normalized: Record<string, number> = {};
	for (const [id, amount] of Object.entries(attributes)) {
		normalized[normalizeAttributeId(id) ?? id] = amount;
	}
	return normalized;
}

function asFarmingPlayer(source: FarmingAttributeShardSourceContext): FarmingPlayer {
	if ('options' in source) return source;
	return {
		options: {
			attributes: source.attributes,
			infestedPlotProbability: source.infestedPlotProbability,
			selectedCrop: source.crop,
		} as PlayerOptions,
	} as FarmingPlayer;
}

function withShardLevel(player: FarmingPlayer, shard: FarmingAttributeShard, level: number): FarmingPlayer {
	return {
		...player,
		options: {
			...player.options,
			attributes: {
				...player.options.attributes,
				[shard.attributeId]: getShardsForLevel(shard.rarity, level),
			},
		},
	} as FarmingPlayer;
}

export function getShardActive(
	shard: FarmingAttributeShard,
	source: FarmingAttributeShardSourceContext
): FortuneSourceActiveState {
	const player = asFarmingPlayer(source);
	const crop = 'options' in source ? source.options.selectedCrop : source.crop;
	const env = buildEffectEnvironment(player, crop);
	return shard.getActive?.(player, env) ?? { active: true };
}

export function getShardFortune(
	shard: FarmingAttributeShard,
	source: FarmingAttributeShardSourceContext,
	level?: number
): number {
	return getShardStat(shard, source, Stat.FarmingFortune, level);
}

export function getShardStat(
	shard: FarmingAttributeShard,
	source: FarmingAttributeShardSourceContext,
	stat: Stat,
	level?: number
): number {
	const basePlayer = asFarmingPlayer(source);
	const player = level === undefined ? basePlayer : withShardLevel(basePlayer, shard, level);
	if (!getShardActive(shard, player).active) return 0;
	const resolvedLevel = level ?? shard.getLevel(player);
	return (shard.statsPerLevel[stat] ?? 0) * resolvedLevel;
}
