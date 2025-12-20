import type { Crop } from '../constants/crops.js';
import { MATCHING_SPECIAL_CROP, SPECIAL_CROP_INFO } from '../constants/specialcrops.js';

export function calculateAverageSpecialCrops(blocksBroken: number, crop: Crop, armor: 1 | 2 | 3 | 4, multiplier = 1) {
	const type = MATCHING_SPECIAL_CROP[crop];

	const { rates, npc, id } = SPECIAL_CROP_INFO[type];
	const chance = rates[armor - 1] ?? 0;
	const amount = blocksBroken * chance * multiplier;

	return {
		id: id,
		type: type,
		amount: amount,
		npc: npc * amount,
	};
}
