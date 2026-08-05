import { getShardLevel } from '../../../../constants/attribute-leveling.js';
import { Crop } from '../../../../constants/crops.js';
import { Rarity } from '../../../../constants/reforges.js';
import { Stat } from '../../../../constants/stats.js';
import type { EffectEnvironment } from '../../../../effects/types.js';
import type { FarmingPlayer } from '../../../../player/player.js';
import type { FortuneSourceActiveState } from '../../base.js';
import { ATTRIBUTE_SHARDS_STAT_SOURCE, FarmingAttributeShard } from '../attribute-shard.js';

export class FireflyShard extends FarmingAttributeShard {
	readonly attributeId = 'solar_power';
	readonly name = 'Firefly Shard';
	readonly skyblockId = 'SHARD_FIREFLY';
	readonly rarity = Rarity.Epic;
	readonly wiki = 'https://w.elitesb.gg/Firefly_Shard';
	readonly statsPerLevel = { [Stat.FarmingFortune]: 5 };
	readonly effectSource = ATTRIBUTE_SHARDS_STAT_SOURCE;

	getActive(player: FarmingPlayer, env: EffectEnvironment): FortuneSourceActiveState {
		const fireflyLevel = this.getLevel(player);
		const lunarLevel = getShardLevel(Rarity.Epic, player.options.attributes?.lunar_power);
		if (env.selectedCrop === Crop.Sunflower)
			return { active: true, reason: 'Forced active by selected Sunflower.' };
		if (env.selectedCrop === Crop.Moonflower) {
			return {
				active: false,
				reason: 'Disabled by selected Moonflower (Lunar Moth used instead).',
				fortune: 5 * lunarLevel,
			};
		}
		if (lunarLevel >= fireflyLevel) {
			return {
				active: false,
				reason: 'Lunar Moth shard is at a higher or equal level, using it instead.',
				fortune: 5 * lunarLevel,
			};
		}
		return { active: true, reason: 'Active during the day.' };
	}
}
