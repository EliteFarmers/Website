import { FarmingMechanic } from '../../../../constants/mechanics.js';
import { Rarity } from '../../../../constants/reforges.js';
import type { Effect, EffectEnvironment } from '../../../../effects/types.js';
import type { FarmingPlayer } from '../../../../player/player.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class RatShard extends FarmingAttributeShard {
	readonly attributeId = 'sprayonator_serendipity';
	readonly name = 'Rat Shard';
	readonly skyblockId = 'SHARD_RAT';
	readonly rarity = Rarity.Uncommon;
	readonly wiki = 'https://w.elitesb.gg/Rat_Shard';

	getEffects(player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		const level = this.getLevel(player);
		return level > 0
			? [
					{
						source: this.name,
						op: 'add-mechanic',
						mechanic: FarmingMechanic.SprayonatorMaterialChance,
						value: level,
						meta: {
							description: 'Chance for Pests to drop an extra Sprayonator Material',
							valueDisplay: 'percent',
						},
					},
				]
			: [];
	}
}
