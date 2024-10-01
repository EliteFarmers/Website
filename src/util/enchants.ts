import { Crop } from "../constants/crops";
import { FarmingEnchant, FarmingEnchantTier } from "../constants/enchants";
import { Stat } from "../constants/stats";
import { PlayerOptions } from "../player/player";

export function getFortuneFromEnchant(level: number, enchant: FarmingEnchant, options?: PlayerOptions, crop?: Crop): number {
	if (level <= 0) return 0;

	const tier = enchant.levels?.[level];
	if (!tier) return 0;

	let fortune = getFortuneFromTier(tier, options, crop, enchant);

	if (enchant.computedLevels && options) {
		const computedTier = enchant.computedLevels(options)?.[level];
		if (computedTier) {
			fortune += getFortuneFromTier(computedTier, options, crop, enchant);
		}
	}

	return fortune;
}

export function getMaxFortuneFromEnchant(enchant: FarmingEnchant, options?: PlayerOptions, crop?: Crop): number {
	if (enchant.maxStats) {
		return enchant.maxStats[Stat.FarmingFortune] ?? 0;
	}

	const tier = enchant.levels?.[enchant.maxLevel];
	if (!tier) return 0;

	let fortune = getFortuneFromTier(tier, options, crop, enchant);

	if (enchant.computedLevels && options) {
		const computedTier = enchant.computedLevels(options)?.[enchant.maxLevel];
		if (computedTier) {
			fortune += getFortuneFromTier(computedTier, options, crop, enchant);
		}
	}

	return fortune;
}

function getFortuneFromTier(tier: FarmingEnchantTier, options: PlayerOptions | undefined, crop: Crop | undefined, enchant: FarmingEnchant) {
	let fortune = tier.stats?.[Stat.FarmingFortune] ?? 0;

	if (options) {
		fortune += tier.computed?.[Stat.FarmingFortune]?.(options) ?? 0;
	}

	if (crop && (!enchant.cropSpecific || enchant.cropSpecific === crop)) {
		fortune += tier.cropComputed?.[Stat.FarmingFortune]?.(crop, options) ?? 0;
	}
	
	return fortune;
}