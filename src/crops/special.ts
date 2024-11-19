import { Crop } from '../constants/crops.js';
import { MATCHING_SPECIAL_CROP, SPECIAL_CROP_INFO } from '../constants/specialcrops.js';

export function calculateAverageSpecialCrops(blocksBroken: number, crop: Crop, armor: 1 | 2 | 3 | 4) {
	const type = MATCHING_SPECIAL_CROP[crop];

	const { rates, npc } = SPECIAL_CROP_INFO[type];
	const chance = rates[armor - 1] ?? 0;
	const amount = blocksBroken * chance;

	return {
		type,
		amount: amount,
		npc: npc * amount,
	};
}
