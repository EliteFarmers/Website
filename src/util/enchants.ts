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
	if (level <= 0) return 0;

	const tier = enchant.levels?.[level];
	if (!tier) return 0;

	let value = getStatFromTier(tier, stat, options, crop, enchant);

	if (enchant.computedLevels && options) {
		const computedTier = enchant.computedLevels(options)?.[level];
		if (computedTier) {
			value += getStatFromTier(computedTier, stat, options, crop, enchant);
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

	let value = getStatFromTier(tier, stat, options, crop, enchant);

	if (enchant.computedLevels && options) {
		const computedTier = enchant.computedLevels(options)?.[enchant.maxLevel];
		if (computedTier) {
			value += getStatFromTier(computedTier, stat, options, crop, enchant);
		}
	}

	return value;
}

function getStatFromTier(
	tier: FarmingEnchantTier,
	stat: Stat,
	options: PlayerOptions | undefined,
	crop: Crop | undefined,
	enchant: FarmingEnchant
) {
	let value = tier.stats?.[stat] ?? 0;

	if (options) {
		value += tier.computed?.[stat]?.(options) ?? 0;
	}

	if (crop && (!enchant.cropSpecific || enchant.cropSpecific === crop)) {
		value += tier.cropComputed?.[stat]?.(crop, options) ?? 0;
	}

	return value;
}
