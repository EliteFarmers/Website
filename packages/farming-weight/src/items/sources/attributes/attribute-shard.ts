import { getShardLevel } from '../../../constants/attribute-leveling.js';
import type { Rarity } from '../../../constants/reforges.js';
import type { Stat } from '../../../constants/stats.js';
import type { Effect, EffectEnvironment } from '../../../effects/types.js';
import type { FarmingPlayer } from '../../../player/player.js';
import { FortuneSource } from '../base.js';
import { statsToEffects } from '../effects-util.js';

export const ATTRIBUTE_SHARDS_STAT_SOURCE = 'Attribute Shards';

export abstract class FarmingAttributeShard extends FortuneSource {
	abstract readonly attributeId: string;
	abstract readonly name: string;
	abstract readonly skyblockId: string;
	abstract readonly rarity: Rarity;
	abstract readonly wiki: string;

	readonly statsPerLevel: Partial<Record<Stat, number>> = {};
	readonly effectSource?: string;

	get id(): string {
		return this.attributeId;
	}

	getAmount(attributes?: Record<string, number>): number {
		return attributes?.[this.attributeId] ?? attributes?.[this.skyblockId] ?? 0;
	}

	getLevel(player: FarmingPlayer): number {
		return getShardLevel(this.rarity, this.getAmount(player.options.attributes));
	}

	getEffects(player: FarmingPlayer, env: EffectEnvironment): Effect[] {
		const active = this.getActive?.(player, env);
		if (active && !active.active) return [];

		const level = this.getLevel(player);
		if (level <= 0) return [];

		const stats = Object.fromEntries(
			Object.entries(this.statsPerLevel).map(([stat, value]) => [stat, value * level])
		) as Partial<Record<Stat, number>>;
		return statsToEffects(stats, this.effectSource ?? this.name);
	}
}
