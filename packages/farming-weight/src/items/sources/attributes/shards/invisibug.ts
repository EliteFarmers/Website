import { Rarity } from '../../../../constants/reforges.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class InvisibugShard extends FarmingAttributeShard {
	readonly attributeId = 'fancy_visit';
	readonly name = 'Invisibug Shard';
	readonly skyblockId = 'SHARD_INVISIBUG';
	readonly rarity = Rarity.Rare;
	readonly wiki = 'https://w.elitesb.gg/Invisibug_Shard';
}
