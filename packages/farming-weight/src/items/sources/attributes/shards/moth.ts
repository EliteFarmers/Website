import { FarmingMechanic } from '../../../../constants/mechanics.js';
import { Rarity } from '../../../../constants/reforges.js';
import type { Effect, EffectEnvironment } from '../../../../effects/types.js';
import type { FarmingPlayer } from '../../../../player/player.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class MothShard extends FarmingAttributeShard {
	readonly attributeId = 'pest_cooldown';
	readonly name = 'Moth Shard';
	readonly skyblockId = 'SHARD_MOTH';
	readonly rarity = Rarity.Uncommon;
	readonly wiki = 'https://w.elitesb.gg/Moth_Shard';

	getEffects(player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		const level = this.getLevel(player);
		return level > 0
			? [
					{
						source: this.name,
						op: 'add-mechanic',
						mechanic: FarmingMechanic.PestCooldownReductionSeconds,
						value: level * 0.5,
						meta: {
							description: 'Flat Pest spawn cooldown reduction',
							valueDisplay: 'stat',
						},
					},
				]
			: [];
	}
}
