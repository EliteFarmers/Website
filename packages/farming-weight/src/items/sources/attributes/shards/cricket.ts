import { Rarity } from '../../../../constants/reforges.js';
import { Stat } from '../../../../constants/stats.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class CricketShard extends FarmingAttributeShard {
	readonly attributeId = 'pest_fortune';
	readonly name = 'Cricket Shard';
	readonly skyblockId = 'SHARD_CRICKET';
	readonly rarity = Rarity.Uncommon;
	readonly wiki = 'https://w.elitesb.gg/Cricket_Shard';
	readonly statsPerLevel = { [Stat.PestKillFortune]: 5 };
}
