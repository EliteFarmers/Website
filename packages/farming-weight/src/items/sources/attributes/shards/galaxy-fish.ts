import { Rarity } from '../../../../constants/reforges.js';
import { Stat } from '../../../../constants/stats.js';
import { ATTRIBUTE_SHARDS_STAT_SOURCE, FarmingAttributeShard } from '../attribute-shard.js';

export class GalaxyFishShard extends FarmingAttributeShard {
	readonly attributeId = 'ultimate_dna';
	readonly name = 'Galaxy Fish Shard';
	readonly skyblockId = 'SHARD_GALAXY_FISH';
	readonly rarity = Rarity.Legendary;
	readonly wiki = 'https://w.elitesb.gg/Galaxy_Fish_Shard';
	readonly statsPerLevel = {
		[Stat.FarmingFortune]: 1,
		[Stat.MiningFortune]: 1,
		[Stat.ForagingFortune]: 1,
	};
	readonly effectSource = ATTRIBUTE_SHARDS_STAT_SOURCE;
}
