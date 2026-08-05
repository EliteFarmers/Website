import { Crop } from '../../../../constants/crops.js';
import { Rarity } from '../../../../constants/reforges.js';
import type { Effect, EffectEnvironment } from '../../../../effects/types.js';
import type { FarmingPlayer } from '../../../../player/player.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class WartyBugShard extends FarmingAttributeShard {
	readonly attributeId = 'wart_eater';
	readonly name = 'Warty Bug Shard';
	readonly skyblockId = 'SHARD_WARTYBUG';
	readonly rarity = Rarity.Legendary;
	readonly wiki = 'https://w.elitesb.gg/Wartybug_Shard';

	getEffects(player: FarmingPlayer, env: EffectEnvironment): Effect[] {
		if (env.crop !== Crop.NetherWart) return [];

		const level = this.getLevel(player);
		if (level <= 0) return [];
		const chance = 0.00005 * level;

		return [
			{
				source: this.name,
				op: 'add-drop',
				scope: { crops: [Crop.NetherWart] },
				drop: {
					itemId: 'WARTY',
					chance,
					dropKind: 'rare',
					tags: ['overbloom', 'rare-crop'],
				},
				meta: { description: `${(chance * 100).toFixed(3)}% chance per block to drop Warty` },
			},
		];
	}
}
