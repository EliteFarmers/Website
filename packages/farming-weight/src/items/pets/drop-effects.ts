import type { Effect } from '../../effects/types.js';
import type { FarmingPet } from '../../fortune/farmingpet.js';

export function petDropEffects(
	source: string,
	itemIds: readonly string[],
	maxTotalChance: number,
	pet: FarmingPet
): Effect[] {
	if (itemIds.length === 0 || maxTotalChance <= 0) return [];

	const chancePerItem = (maxTotalChance * Math.min(Math.max(pet.level, 0), 100)) / 100 / itemIds.length;
	return itemIds.map((itemId) => ({
		source,
		op: 'add-drop',
		drop: {
			itemId,
			chance: chancePerItem,
			dropKind: 'rare',
			tags: ['pet-drop'],
		},
	}));
}
