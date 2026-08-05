import { Rarity } from '../../../../constants/reforges.js';
import { Stat } from '../../../../constants/stats.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class KeeledSlugShard extends FarmingAttributeShard {
	readonly attributeId = 'bonus_pest_chance';
	readonly name = 'Keeled Slug Shard';
	readonly skyblockId = 'SHARD_KEELED_SLUG';
	readonly rarity = Rarity.Uncommon;
	readonly wiki = 'https://w.elitesb.gg/Keeled_Slug_Shard';
	readonly statsPerLevel = { [Stat.BonusPestChance]: 1 };
}
