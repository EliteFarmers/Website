import { Rarity } from '../../../../constants/reforges.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class MudwormShard extends FarmingAttributeShard {
	readonly attributeId = 'visitor_bait';
	readonly name = 'Mudworm Shard';
	readonly skyblockId = 'SHARD_MUDWORM';
	readonly rarity = Rarity.Common;
	readonly wiki = 'https://w.elitesb.gg/Mudworm_Shard';
}
