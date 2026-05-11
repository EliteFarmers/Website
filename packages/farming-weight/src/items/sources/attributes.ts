import { FARMING_ATTRIBUTE_SHARDS, getAttributeAmount, getShardLevel } from '../../constants/attributes.js';
import { Crop } from '../../constants/crops.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import type { Effect, EffectEnvironment } from '../../effects/types.js';
import type { FarmingPlayer } from '../../player/player.js';
import { FortuneSource, type FortuneSourceActiveState } from './base.js';

const ATTRIBUTE_SHARDS_STAT_SOURCE = 'Attribute Shards';

/**
 * Cropeetle Shard - `+2%` to Special Crop drops per level (max `+20%` at
 * level 10), expressed as a single `mul-rare` factor `1 + 0.02 * level`.
 *
 * Scoped to the `special-crop` tag so it does NOT leak to Seasoning, Burrowing
 * Spores, feast materials, or other Overbloom-tagged drops.
 */
export class CropeetleShard extends FortuneSource {
	readonly id = 'cropeetle';
	readonly name = FARMING_ATTRIBUTE_SHARDS.crop_bug?.name ?? 'Cropeetle Shard';

	getEffects(player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		const level = getShardLevel(Rarity.Rare, getAttributeAmount(player.options.attributes, 'crop_bug'));
		if (level <= 0) return [];

		const factor = 1 + 0.02 * level;

		return [
			{
				source: this.name,
				op: 'mul-rare',
				value: factor,
				scope: { tags: ['special-crop'] },
				relatedStats: [Stat.Overbloom],
				meta: {
					description: `Conditional Overbloom - +${(level * 2).toFixed(0)}% Cropie, Squash, Fermento, and Helianthus drops`,
					valueDisplay: 'factor',
				},
			},
		];
	}
}

/**
 * Warty Bug Shard - adds Warty drops while farming Nether Wart.
 *
 * Emits an `add-drop` effect crop-scoped to Nether Wart. Drops are tagged
 * `['overbloom','rare-crop']` so Overbloom (and any future global rare-crop
 * multipliers) buff them by default. The drop kind is `'rare'`.
 */
export class WartyBugShard extends FortuneSource {
	readonly id = 'wart_eater';
	readonly name = FARMING_ATTRIBUTE_SHARDS.wart_eater?.name ?? 'Warty Bug Shard';

	getEffects(player: FarmingPlayer, env: EffectEnvironment): Effect[] {
		if (env.crop !== Crop.NetherWart) return [];

		const level = getShardLevel(Rarity.Legendary, getAttributeAmount(player.options.attributes, 'wart_eater'));
		if (level <= 0) return [];

		const chance = 0.00005 * level;

		return [
			{
				source: this.name,
				op: 'add-drop',
				scope: { crops: [Crop.NetherWart] },
				drop: {
					itemId: 'WARTY',
					chance,
					dropKind: 'rare',
					tags: ['overbloom', 'rare-crop'],
				},
				meta: { description: `${(chance * 100).toFixed(3)}% chance per block to drop Warty` },
			},
		];
	}
}

/**
 * Dragonfly Shard - `+0.5` Farming Wisdom per level. Always active.
 */
export class DragonflyShard extends FortuneSource {
	readonly id = 'dragonfly';
	readonly name = FARMING_ATTRIBUTE_SHARDS.garden_wisdom?.name ?? 'Dragonfly Shard';

	getEffects(player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		const level = getShardLevel(Rarity.Epic, getAttributeAmount(player.options.attributes, 'garden_wisdom'));
		if (level <= 0) return [];

		return [{ source: ATTRIBUTE_SHARDS_STAT_SOURCE, op: 'add-stat', stat: Stat.FarmingWisdom, value: 0.5 * level }];
	}
}

/**
 * Firefly Shard - `+5` Farming Fortune per level during the day.
 *
 * Active rules (preserved from the existing implementation, which assumes the
 * world is during the day unless overridden):
 *  - If the player has selected Sunflower, force active.
 *  - If the player has selected Moonflower, force inactive.
 *  - If Lunar Moth shard is at an equal-or-higher level, defer to it (inactive).
 *  - Otherwise active.
 */
export class FireflyShard extends FortuneSource {
	readonly id = 'firefly';
	readonly name = FARMING_ATTRIBUTE_SHARDS.solar_power?.name ?? 'Firefly Shard';

	private resolve(player: FarmingPlayer, env: EffectEnvironment) {
		const fireflyAmount = getAttributeAmount(player.options.attributes, 'solar_power');
		const lunarAmount = getAttributeAmount(player.options.attributes, 'lunar_power');
		const fireflyLevel = getShardLevel(Rarity.Epic, fireflyAmount);
		const lunarLevel = getShardLevel(Rarity.Epic, lunarAmount);
		return { fireflyLevel, lunarLevel, env };
	}

	getActive(player: FarmingPlayer, env: EffectEnvironment): FortuneSourceActiveState {
		const { fireflyLevel, lunarLevel } = this.resolve(player, env);
		if (env.selectedCrop === Crop.Sunflower) {
			return { active: true, reason: 'Forced active by selected Sunflower.' };
		}
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

	getEffects(player: FarmingPlayer, env: EffectEnvironment): Effect[] {
		const { fireflyLevel } = this.resolve(player, env);
		if (fireflyLevel <= 0) return [];
		const state = this.getActive(player, env);
		if (!state.active) return [];

		return [
			{
				source: ATTRIBUTE_SHARDS_STAT_SOURCE,
				op: 'add-stat',
				stat: Stat.FarmingFortune,
				value: 5 * fireflyLevel,
			},
		];
	}
}

/**
 * Lunar Moth Shard - `+5` Farming Fortune per level during the night.
 *
 * Active rules mirror Firefly (Moonflower forces active, Sunflower forces
 * inactive, otherwise the higher-level shard wins ties going to Lunar Moth).
 */
export class LunarMothShard extends FortuneSource {
	readonly id = 'lunar_moth';
	readonly name = FARMING_ATTRIBUTE_SHARDS.lunar_power?.name ?? 'Lunar Moth Shard';

	private resolve(player: FarmingPlayer) {
		const fireflyAmount = getAttributeAmount(player.options.attributes, 'solar_power');
		const lunarAmount = getAttributeAmount(player.options.attributes, 'lunar_power');
		const fireflyLevel = getShardLevel(Rarity.Epic, fireflyAmount);
		const lunarLevel = getShardLevel(Rarity.Epic, lunarAmount);
		return { fireflyLevel, lunarLevel };
	}

	getActive(player: FarmingPlayer, env: EffectEnvironment): FortuneSourceActiveState {
		const { fireflyLevel, lunarLevel } = this.resolve(player);
		if (env.selectedCrop === Crop.Moonflower) {
			return { active: true, reason: 'Forced active by selected Moonflower.' };
		}
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

	getEffects(player: FarmingPlayer, env: EffectEnvironment): Effect[] {
		const { lunarLevel } = this.resolve(player);
		if (lunarLevel <= 0) return [];
		const state = this.getActive(player, env);
		if (!state.active) return [];

		return [
			{ source: ATTRIBUTE_SHARDS_STAT_SOURCE, op: 'add-stat', stat: Stat.FarmingFortune, value: 5 * lunarLevel },
		];
	}
}

/**
 * Termite Shard - `+3` Farming Fortune per level while on an infested plot.
 */
export class TermiteShard extends FortuneSource {
	readonly id = 'termite';
	readonly name = FARMING_ATTRIBUTE_SHARDS.infiltration?.name ?? 'Termite Shard';

	getActive(player: FarmingPlayer, env: EffectEnvironment): FortuneSourceActiveState {
		const level = getShardLevel(Rarity.Uncommon, getAttributeAmount(player.options.attributes, 'infiltration'));
		if (!env.infestedPlot) {
			return {
				active: false,
				reason: 'Termite shard is only active on infested plots.',
				fortune: 3 * level,
			};
		}
		return { active: true, reason: 'Active on infested plots.' };
	}

	getEffects(player: FarmingPlayer, env: EffectEnvironment): Effect[] {
		if (!env.infestedPlot) return [];
		const level = getShardLevel(Rarity.Uncommon, getAttributeAmount(player.options.attributes, 'infiltration'));
		if (level <= 0) return [];
		return [{ source: ATTRIBUTE_SHARDS_STAT_SOURCE, op: 'add-stat', stat: Stat.FarmingFortune, value: 3 * level }];
	}
}

/**
 * Galaxy Fish Shard - `+1` Farming/Mining/Foraging Fortune per level.
 */
export class GalaxyFishShard extends FortuneSource {
	readonly id = 'galaxy_fish';
	readonly name = FARMING_ATTRIBUTE_SHARDS.ultimate_dna?.name ?? 'Galaxy Fish Shard';

	getEffects(player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		const level = getShardLevel(Rarity.Legendary, getAttributeAmount(player.options.attributes, 'ultimate_dna'));
		if (level <= 0) return [];
		const out: Effect[] = [
			{ source: ATTRIBUTE_SHARDS_STAT_SOURCE, op: 'add-stat', stat: Stat.FarmingFortune, value: 1 * level },
			{ source: ATTRIBUTE_SHARDS_STAT_SOURCE, op: 'add-stat', stat: Stat.MiningFortune, value: 1 * level },
			{ source: ATTRIBUTE_SHARDS_STAT_SOURCE, op: 'add-stat', stat: Stat.ForagingFortune, value: 1 * level },
		];
		return out;
	}
}

export class LadybugShard extends FortuneSource {
	readonly id = 'ladybug';
	readonly name = FARMING_ATTRIBUTE_SHARDS.pretty_clothes?.name ?? 'Ladybug Shard';

	getEffects(_player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		return [];
	}
}

export class InvisibugShard extends FortuneSource {
	readonly id = 'invisibug';
	readonly name = FARMING_ATTRIBUTE_SHARDS.fancy_visit?.name ?? 'Invisibug Shard';

	getEffects(_player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		return [];
	}
}

export class PrayingMantisShard extends FortuneSource {
	readonly id = 'praying_mantis';
	readonly name = FARMING_ATTRIBUTE_SHARDS.insect_power?.name ?? 'Praying Mantis Shard';

	getEffects(_player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		return [];
	}
}

export class PestShard extends FortuneSource {
	readonly id = 'pest';
	readonly name = FARMING_ATTRIBUTE_SHARDS.pest_luck?.name ?? 'Pest Shard';

	getEffects(_player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		return [];
	}
}

export class MudwormShard extends FortuneSource {
	readonly id = 'mudworm';
	readonly name = FARMING_ATTRIBUTE_SHARDS.visitor_bait?.name ?? 'Mudworm Shard';

	getEffects(_player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		return [];
	}
}

/**
 * Class registry of every farming attribute shard, keyed by the SkyBlock
 * attribute key (matching `FARMING_ATTRIBUTE_SHARDS`). Use this to enumerate
 * sources during effect collection.
 */
export const FARMING_ATTRIBUTE_SHARD_CLASSES = {
	wart_eater: new WartyBugShard(),
	garden_wisdom: new DragonflyShard(),
	solar_power: new FireflyShard(),
	lunar_power: new LunarMothShard(),
	pretty_clothes: new LadybugShard(),
	crop_bug: new CropeetleShard(),
	fancy_visit: new InvisibugShard(),
	infiltration: new TermiteShard(),
	insect_power: new PrayingMantisShard(),
	pest_luck: new PestShard(),
	visitor_bait: new MudwormShard(),
	ultimate_dna: new GalaxyFishShard(),
} as const satisfies Record<string, FortuneSource>;
