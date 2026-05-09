import type { Crop } from '../constants/crops.js';
import type { FarmingPlayer } from '../player/player.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import type { EffectEnvironment } from './types.js';

/**
 * Single source-of-truth for building an `EffectEnvironment` from a player.
 *
 * No other call site is allowed to construct an `EffectEnvironment` ad-hoc.
 * Field derivations are intentionally simple and tested.
 */
export function buildEffectEnvironment(player: FarmingPlayer, crop?: Crop): EffectEnvironment {
	return buildEffectEnvironmentFromOptions(player.options, crop);
}

export function buildEffectEnvironmentFromOptions(
	opts: PlayerOptions | undefined,
	crop?: Crop
): EffectEnvironment {
	const harvestFeast = opts?.harvestFeast?.active === true;

	let inSeason = false;
	if (harvestFeast && crop !== undefined) {
		const grand = opts?.harvestFeast?.grandFeast === true;
		if (grand) {
			inSeason = true;
		} else {
			const seasonList = opts?.harvestFeast?.inSeasonCrops;
			inSeason = Array.isArray(seasonList) ? seasonList.includes(crop) : false;
		}
	}

	const infestedPlot =
		typeof opts?.infestedPlotProbability === 'number' && opts.infestedPlotProbability > 0;

	const selectedCrop = opts?.selectedCrop;

	return {
		crop,
		harvestFeast,
		inSeason,
		infestedPlot,
		selectedCrop,
	};
}
