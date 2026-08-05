import { getShardLevel } from '../../../../constants/attribute-leveling.js';
import { Crop } from '../../../../constants/crops.js';
import { Rarity } from '../../../../constants/reforges.js';
import { Stat } from '../../../../constants/stats.js';
import type { EffectEnvironment } from '../../../../effects/types.js';
import type { FarmingPlayer } from '../../../../player/player.js';
import type { FortuneSourceActiveState } from '../../base.js';
import { ATTRIBUTE_SHARDS_STAT_SOURCE, FarmingAttributeShard } from '../attribute-shard.js';

export class LunarMothShard extends FarmingAttributeShard {
	readonly attributeId = 'lunar_power';
	readonly name = 'Lunar Moth Shard';
	readonly skyblockId = 'SHARD_LUNAR_MOTH';
	readonly rarity = Rarity.Epic;
	readonly wiki = 'https://w.elitesb.gg/Lunar_Moth_Shard';
	readonly statsPerLevel = { [Stat.FarmingFortune]: 5 };
	readonly effectSource = ATTRIBUTE_SHARDS_STAT_SOURCE;

	getActive(player: FarmingPlayer, env: EffectEnvironment): FortuneSourceActiveState {
		const fireflyLevel = getShardLevel(Rarity.Epic, player.options.attributes?.solar_power);
		const lunarLevel = this.getLevel(player);
		if (env.selectedCrop === Crop.Moonflower)
			return { active: true, reason: 'Forced active by selected Moonflower.' };
		if (env.selectedCrop === Crop.Sunflower) {
			return {
				active: false,
				reason: 'Disabled by selected Sunflower (Firefly used instead).',
				fortune: 5 * fireflyLevel,
			};
		}
		if (fireflyLevel > lunarLevel) {
			return {
				active: false,
				reason: 'Firefly shard is at a higher level, using it instead.',
				fortune: 5 * fireflyLevel,
			};
		}
		return { active: true, reason: 'Active during the night.' };
	}
}
