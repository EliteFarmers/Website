import { Rarity } from '../../../../constants/reforges.js';
import { Stat } from '../../../../constants/stats.js';
import type { Effect, EffectEnvironment } from '../../../../effects/types.js';
import type { FarmingPlayer } from '../../../../player/player.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class PestShard extends FarmingAttributeShard {
	readonly attributeId = 'pest_luck';
	readonly name = 'Field Mouse Shard';
	readonly skyblockId = 'SHARD_PEST';
	readonly rarity = Rarity.Uncommon;
	readonly wiki = 'https://w.elitesb.gg/Pest';
	readonly statsPerLevel = { [Stat.Overbloom]: 0.5 };

	getEffects(player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		const level = this.getLevel(player);
		if (level <= 0) return [];

		return [
			{
				source: this.name,
				op: 'add-rare-pct',
				value: level * 0.5,
				scope: { tags: ['pest'] },
				relatedStats: [Stat.Overbloom],
				meta: {
					description: 'Pest Overbloom',
					valueDisplay: 'stat',
					valueStat: Stat.Overbloom,
				},
			},
		];
	}
}
