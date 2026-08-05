import { Rarity } from '../../../../constants/reforges.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class PrayingMantisShard extends FarmingAttributeShard {
	readonly attributeId = 'insect_power';
	readonly name = 'Praying Mantis Shard';
	readonly skyblockId = 'SHARD_PRAYING_MANTIS';
	readonly rarity = Rarity.Uncommon;
	readonly wiki = 'https://w.elitesb.gg/Praying_Mantis_Shard';
}
