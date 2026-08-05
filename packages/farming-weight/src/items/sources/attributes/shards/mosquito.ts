import { CROP_INFO } from '../../../../constants/crops.js';
import { FarmingMechanic } from '../../../../constants/mechanics.js';
import { Rarity } from '../../../../constants/reforges.js';
import type { Effect, EffectEnvironment } from '../../../../effects/types.js';
import type { FarmingPlayer } from '../../../../player/player.js';
import { FarmingAttributeShard } from '../attribute-shard.js';

export class MosquitoShard extends FarmingAttributeShard {
	readonly attributeId = 'enchanted_farmer';
	readonly name = 'Mosquito Shard';
	readonly skyblockId = 'SHARD_MOSQUITO';
	readonly rarity = Rarity.Uncommon;
	readonly wiki = 'https://w.elitesb.gg/Mosquito_Shard';

	getEffects(player: FarmingPlayer, env: EffectEnvironment): Effect[] {
		const level = this.getLevel(player);
		if (level <= 0) return [];

		const effects: Effect[] = [
			{
				source: this.name,
				op: 'add-mechanic',
				mechanic: FarmingMechanic.EnchantedCropChance,
				value: level * 0.001,
				meta: { description: 'Chance to find an Enchanted Crop while Farming', valueDisplay: 'percent' },
			},
		];
		if (!env.crop) return effects;

		const enchantedCrops = CROP_INFO[env.crop].crafts.filter((craft) => craft.takes === 160);
		for (const craft of enchantedCrops) {
			effects.push({
				source: this.name,
				op: 'add-drop',
				scope: { crops: [env.crop] },
				drop: {
					itemId: craft.item,
					chance: (level * 0.00001) / enchantedCrops.length,
					dropKind: 'crop',
					tags: [],
				},
			});
		}
		return effects;
	}
}
