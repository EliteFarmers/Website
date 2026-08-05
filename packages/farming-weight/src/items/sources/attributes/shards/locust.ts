import { FarmingMechanic } from '../../../../constants/mechanics.js';
import { Rarity } from '../../../../constants/reforges.js';
import type { Effect, EffectEnvironment } from '../../../../effects/types.js';
import type { FarmingPlayer } from '../../../../player/player.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class LocustShard extends FarmingAttributeShard {
	readonly attributeId = 'crop_speed';
	readonly name = 'Locust Shard';
	readonly skyblockId = 'SHARD_LOCUST';
	readonly rarity = Rarity.Common;
	readonly wiki = 'https://w.elitesb.gg/Locust_Shard';

	getEffects(player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		const level = this.getLevel(player);
		return level > 0
			? [
					{
						source: this.name,
						op: 'add-mechanic',
						mechanic: FarmingMechanic.CropGrowth,
						value: level,
						meta: { description: 'Crop Growth while in The Garden', valueDisplay: 'stat' },
					},
				]
			: [];
	}
}
