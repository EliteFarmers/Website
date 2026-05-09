import { Crop } from '../../constants/crops.js';
import { FARMING_ENCHANTS } from '../../constants/enchants.js';
import { Stat } from '../../constants/stats.js';
import type { Effect, EffectEnvironment } from '../../effects/types.js';
import type { PlayerOptions } from '../../player/playeroptions.js';

/**
 * Compute the effect list contributed by an enchant at a given level.
 *
 * The legacy enchant data has four contribution modes:
 *
 *  - `stats` - flat per-stat per-level numbers (most enchants).
 *  - `computedStats(opt)` - full stat record from the player options
 *    (Dedication, which scales with milestone counts).
 *  - `computed[stat](opt)` - per-stat function of player options
 *    (Green Thumb scaling with `uniqueVisitors`).
 *  - `cropComputed[stat](crop, opt)` - per-stat function of the active crop
 *    (Sunset's Moonflower-zero pattern: `crop === Moonflower ? 0 : level`).
 *
 * Any contribution to `Stat.Overbloom` is converted to an `add-rare-pct` effect
 * with a global overbloom scope and `relatedStats: [Stat.Overbloom]`, so the
 * resolver both adds the contribution to the virtual `Stat.Overbloom` AND
 * applies it as an additive percent to overbloom-tagged drops. All other stats
 * become `add-stat` effects on the named stat (per-crop fortune stats like
 * `CactusFortune` are already crop-gated by the consumer, so no scope is
 * attached).
 *
 * Crop Fever (`ultimate_crop_fever`) emits no effects here - its mechanic is
 * bespoke (Tiered RNG bonus during Harvest Feast) and stays in the legacy
 * pipeline until it is migrated.
 */
export function enchantEffects(
	enchantId: string,
	level: number,
	env: EffectEnvironment,
	options: PlayerOptions,
	optimisticCropComputed = false
): Effect[] {
	const enchant = FARMING_ENCHANTS[enchantId];
	if (!enchant) return [];
	if (level <= 0) return [];

	const tier = enchant.levels[level] ?? enchant.computedLevels?.(options)?.[level];
	if (!tier) return [];

	if (enchant.cropSpecific && env.crop !== undefined && env.crop !== enchant.cropSpecific) {
		return [];
	}

	const sourceName = `Enchant: ${enchant.name}`;
	const out: Effect[] = [];

	const pushStat = (statKey: Stat, value: number) => {
		if (!value) return;
		if (statKey === Stat.Overbloom) {
			out.push({
				source: sourceName,
				op: 'add-rare-pct',
				value,
				scope: { tags: ['overbloom'] },
				relatedStats: [Stat.Overbloom],
				meta: {
					description: 'Normal Overbloom',
					valueDisplay: 'stat',
					valueStat: Stat.Overbloom,
				},
			});
			return;
		}
		out.push({ source: sourceName, op: 'add-stat', stat: statKey, value });
	};

	if (tier.stats) {
		for (const [statKey, value] of Object.entries(tier.stats) as [Stat, number][]) {
			pushStat(statKey, value);
		}
	}

	if (tier.computedStats) {
		const stats = tier.computedStats(options);
		for (const [statKey, value] of Object.entries(stats) as [Stat, number][]) {
			pushStat(statKey, value);
		}
	}

	if (tier.computed) {
		for (const [statKey, fn] of Object.entries(tier.computed) as [
			Stat,
			(opt: PlayerOptions) => number,
		][]) {
			pushStat(statKey, fn(options));
		}
	}

	if (tier.cropComputed) {
		if (env.crop === undefined && !optimisticCropComputed) return out;

		for (const [statKey, fn] of Object.entries(tier.cropComputed) as [
			Stat,
			(crop?: Crop, opt?: PlayerOptions) => number,
		][]) {
			pushStat(statKey, fn(env.crop, options));
		}
	}

	return out;
}
