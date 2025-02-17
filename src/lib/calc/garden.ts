import { CROP_UPGRADE_COSTS } from '$lib/constants/crops';

export function getCopperToMaxUpgrade(level: number): number {
	let totalCost = 0;
	for (let i = level + 1; i <= 9; i++) {
		totalCost += CROP_UPGRADE_COSTS[i] || 0;
	}
	return totalCost;
}

export function getCopperSpent(level: number): number {
	let totalCost = 0;
	for (let i = 1; i <= level; i++) {
		totalCost += CROP_UPGRADE_COSTS[i] || 0;
	}
	return totalCost;
}
