import { Rarity } from '../../../../constants/reforges.js';
import { Stat } from '../../../../constants/stats.js';
import { ATTRIBUTE_SHARDS_STAT_SOURCE, FarmingAttributeShard } from '../attribute-shard.js';

export class FlyShard extends FarmingAttributeShard {
	readonly attributeId = 'fortunate_farmer';
	readonly name = 'Fly Shard';
	readonly skyblockId = 'SHARD_FLY';
	readonly rarity = Rarity.Common;
	readonly wiki = 'https://w.elitesb.gg/Fly_Shard';
	readonly statsPerLevel = { [Stat.FarmingFortune]: 2.5 };
	readonly effectSource = ATTRIBUTE_SHARDS_STAT_SOURCE;
}
