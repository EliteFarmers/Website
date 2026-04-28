import type { Crop } from '../constants/crops.js';
import type { FarmingEnchant, FarmingEnchantTier } from '../constants/enchants.js';
import { Stat } from '../constants/stats.js';
import type { PlayerOptions } from '../player/playeroptions.js';

export function getFortuneFromEnchant(
	level: number,
	enchant: FarmingEnchant,
	options?: PlayerOptions,
	crop?: Crop
): number {
	return getStatFromEnchant(level, enchant, Stat.FarmingFortune, options, crop);
}

export function getStatFromEnchant(
	level: number,
	enchant: FarmingEnchant,
	stat: Stat,
	options?: PlayerOptions,
	crop?: Crop
): number {
	return evalStatFromEnchant(level, enchant, stat, options, crop, false);
}

/**
 * Like {@link getStatFromEnchant}, but when no crop is provided, evaluates
 * `cropComputed` contributions with `undefined` so non-crop-bound items (e.g.
 * armor with Sunset) can resolve per-level deltas without a representative crop.
 */
export function getOptimisticStatFromEnchant(
	level: number,
	enchant: FarmingEnchant,
	stat: Stat,
	options?: PlayerOptions,
	crop?: Crop
): number {
	return evalStatFromEnchant(level, enchant, stat, options, crop, true);
}

function evalStatFromEnchant(
	level: number,
	enchant: FarmingEnchant,
	stat: Stat,
	options: PlayerOptions | undefined,
	crop: Crop | undefined,
	optimistic: boolean
): number {
	if (level <= 0) return 0;

	const tier = enchant.levels?.[level];
	if (!tier) return 0;

	let value = getStatFromTier(tier, stat, options, crop, enchant, optimistic);

	if (enchant.computedLevels && options) {
		const computedTier = enchant.computedLevels(options)?.[level];
		if (computedTier) {
			value += getStatFromTier(computedTier, stat, options, crop, enchant, optimistic);
		}
	}

	return value;
}

export function getMaxFortuneFromEnchant(enchant: FarmingEnchant, options?: PlayerOptions, crop?: Crop): number {
	return getMaxStatFromEnchant(enchant, Stat.FarmingFortune, options, crop);
}

export function getMaxStatFromEnchant(
	enchant: FarmingEnchant,
	stat: Stat,
	options?: PlayerOptions,
	crop?: Crop
): number {
	if (enchant.maxStats) {
		return enchant.maxStats[stat] ?? 0;
	}

	const tier = enchant.levels?.[enchant.maxLevel];
	if (!tier) return 0;

	const optimistic = !crop;
	let value = getStatFromTier(tier, stat, options, crop, enchant, optimistic);

	if (enchant.computedLevels && options) {
		const computedTier = enchant.computedLevels(options)?.[enchant.maxLevel];
		if (computedTier) {
			value += getStatFromTier(computedTier, stat, options, crop, enchant, optimistic);
		}
	}

	return value;
}

function getStatFromTier(
	tier: FarmingEnchantTier,
	stat: Stat,
	options: PlayerOptions | undefined,
	crop: Crop | undefined,
	enchant: FarmingEnchant,
	optimistic = false
) {
	if (crop && enchant.cropSpecific && enchant.cropSpecific !== crop) {
		return 0;
	}

	let value = 0;
	const s = stat;

	value += tier.stats?.[s] ?? 0;

	if (options) {
		value += tier.computed?.[s]?.(options) ?? 0;

		const computedStats = tier.computedStats?.(options);
		if (computedStats) {
			value += computedStats[s] ?? 0;
		}
	}

	if (crop && (!enchant.cropSpecific || enchant.cropSpecific === crop)) {
		value += tier.cropComputed?.[s]?.(crop, options) ?? 0;
	} else if (!crop && optimistic && !enchant.cropSpecific) {
		value += tier.cropComputed?.[s]?.(undefined, options) ?? 0;
	}

	return value;
}
