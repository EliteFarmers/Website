import { Rarity } from '../../../../constants/reforges.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class LadybugShard extends FarmingAttributeShard {
	readonly attributeId = 'pretty_clothes';
	readonly name = 'Ladybug Shard';
	readonly skyblockId = 'SHARD_LADYBUG';
	readonly rarity = Rarity.Rare;
	readonly wiki = 'https://w.elitesb.gg/Ladybug_Shard';
}
