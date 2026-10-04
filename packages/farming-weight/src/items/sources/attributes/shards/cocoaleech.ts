import { Rarity } from '../../../../constants/reforges.js';
import type { Effect, EffectEnvironment } from '../../../../effects/types.js';
import type { FarmingPlayer } from '../../../../player/player.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class CocoaleechShard extends FarmingAttributeShard {
	readonly attributeId = 'groovy_radar';
	readonly name = 'Cocoaleech Shard';
	readonly skyblockId = 'SHARD_COCOALEECH';
	readonly rarity = Rarity.Legendary;
	readonly wiki = 'https://w.elitesb.gg/Cocoaleech_Shard';

	getEffects(player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		const level = this.getLevel(player);
		if (level <= 0) return [];

		return [
			{
				source: this.name,
				op: 'mul-drop',
				scope: {
					tags: ['pest'],
					match: (ctx) => ctx.itemId.startsWith('VINYL_'),
				},
				value: 1 + level * 0.025,
				meta: {
					description: `${level * 2.5}% chance for pests to drop a second Vinyl`,
					valueDisplay: 'none',
				},
			},
		];
	}
}
