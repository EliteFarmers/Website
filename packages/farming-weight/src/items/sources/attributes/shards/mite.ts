import { FarmingMechanic } from '../../../../constants/mechanics.js';
import { Rarity } from '../../../../constants/reforges.js';
import type { Effect, EffectEnvironment } from '../../../../effects/types.js';
import type { FarmingPlayer } from '../../../../player/player.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class MiteShard extends FarmingAttributeShard {
	readonly attributeId = 'filter_upgrade';
	readonly name = 'Mite Shard';
	readonly skyblockId = 'SHARD_MITE';
	readonly rarity = Rarity.Uncommon;
	readonly wiki = 'https://w.elitesb.gg/Mite_Shard';

	getEffects(player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		const level = this.getLevel(player);
		return level > 0
			? [
					{
						source: this.name,
						op: 'add-mechanic',
						mechanic: FarmingMechanic.AtmosphericFilterEffect,
						value: level * 2,
						meta: { description: 'Increased Atmospheric Filter effect', valueDisplay: 'percent' },
					},
				]
			: [];
	}
}
