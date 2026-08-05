import { Rarity } from '../../../../constants/reforges.js';
import { Stat } from '../../../../constants/stats.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class CropeetleShard extends FarmingAttributeShard {
	readonly attributeId = 'crop_bug';
	readonly name = 'Cropeetle Shard';
	readonly skyblockId = 'SHARD_CROPEETLE';
	readonly rarity = Rarity.Rare;
	readonly wiki = 'https://w.elitesb.gg/Cropeetle_Shard';
	readonly statsPerLevel = { [Stat.Overbloom]: 1 };
}
