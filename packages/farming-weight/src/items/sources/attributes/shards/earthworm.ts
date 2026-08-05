import { Rarity } from '../../../../constants/reforges.js';
import { Stat } from '../../../../constants/stats.js';
import type { EffectEnvironment } from '../../../../effects/types.js';
import type { FarmingPlayer } from '../../../../player/player.js';
import type { FortuneSourceActiveState } from '../../base.js';
import { ATTRIBUTE_SHARDS_STAT_SOURCE, FarmingAttributeShard } from '../attribute-shard.js';

export class TermiteShard extends FarmingAttributeShard {
	readonly attributeId = 'infiltration';
	readonly name = 'Earthworm Shard';
	readonly skyblockId = 'SHARD_TERMITE';
	readonly rarity = Rarity.Uncommon;
	readonly wiki = 'https://w.elitesb.gg/Termite_Shard';
	readonly statsPerLevel = { [Stat.FarmingFortune]: 3 };
	readonly effectSource = ATTRIBUTE_SHARDS_STAT_SOURCE;

	getActive(player: FarmingPlayer, env: EffectEnvironment): FortuneSourceActiveState {
		if (!env.infestedPlot) {
			return {
				active: false,
				reason: 'Earthworm shard is only active on infested plots.',
				fortune: 3 * this.getLevel(player),
			};
		}
		return { active: true, reason: 'Active on infested plots.' };
	}
}
