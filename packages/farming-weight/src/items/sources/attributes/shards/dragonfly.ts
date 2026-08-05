import { Rarity } from '../../../../constants/reforges.js';
import { Stat } from '../../../../constants/stats.js';
import { ATTRIBUTE_SHARDS_STAT_SOURCE, FarmingAttributeShard } from '../attribute-shard.js';

export class DragonflyShard extends FarmingAttributeShard {
	readonly attributeId = 'garden_wisdom';
	readonly name = 'Dragonfly Shard';
	readonly skyblockId = 'SHARD_DRAGONFLY';
	readonly rarity = Rarity.Epic;
	readonly wiki = 'https://w.elitesb.gg/Dragonfly_Shard';
	readonly statsPerLevel = { [Stat.FarmingWisdom]: 0.5 };
	readonly effectSource = ATTRIBUTE_SHARDS_STAT_SOURCE;
}
