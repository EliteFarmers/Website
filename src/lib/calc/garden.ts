import { LEVEL_REQUIREMENTS, UPGRADE_CROP_AMOUNTS } from '$lib/constants/composter';
import { CROP_UPGRADE_COSTS } from '$lib/constants/crops';
import {
	COMPOSTER_UPGRADE_CROPS,
	ComposterUpgrade,
	Crop,
	SpecialCrop,
	type ComposterUpgradeCost,
} from 'farming-weight';

export function getCropUpgradeCopperCost(level: number): number {
	let totalCost = 0;
	for (let i = level + 1; i <= 9; i++) {
		totalCost += CROP_UPGRADE_COSTS[i] || 0;
	}
	return totalCost;
}

export function getCopperSpentCropUpgrades(level: number): number {
	let totalCost = 0;
	for (let i = 1; i <= level; i++) {
		totalCost += CROP_UPGRADE_COSTS[i] || 0;
	}
	return totalCost;
}

export function getComposterRequiredCrop(upgradeType: ComposterUpgrade, level: number): Crop {
	const cropIndex = level % 2 === 1 ? 0 : 1;
	return COMPOSTER_UPGRADE_CROPS[upgradeType][cropIndex];
}

export function getComposterCropAmount(upgradeType: ComposterUpgrade, level: number): number {
	return UPGRADE_CROP_AMOUNTS[upgradeType][level];
}

export function getComposterCopperCost(level: number): number {
	return LEVEL_REQUIREMENTS[level - 1].copper;
}

export function getComposterSpecialCropRequirement(level: number): { specialCrop: SpecialCrop | null; amount: number } {
	const requirement = LEVEL_REQUIREMENTS[level - 1];
	return {
		specialCrop: requirement.specialCrop,
		amount: requirement.specialCropAmount,
	};
}

export function getComposterUpgradeCost(upgradeType: ComposterUpgrade, level: number): ComposterUpgradeCost {
	const { specialCrop, amount: specialCropAmount } = getComposterSpecialCropRequirement(level);
	const copper = getComposterCopperCost(level);
	const crop = getComposterRequiredCrop(upgradeType, level);
	const cropAmount = getComposterCropAmount(upgradeType, level);

	return {
		copper,
		specialCrop,
		specialCropAmount,
		crop,
		cropAmount,
	};
}

export function getEnchantedCropCollectionAmount(crop: Crop, tier: number): number {
	switch (tier) {
		case 1:
			return 160;
		case 2:
			switch (crop) {
				case Crop.Mushroom:
					return 32 * getEnchantedCropCollectionAmount(crop, 1);
				case Crop.CocoaBeans:
				case Crop.Carrot:
					return 128 * getEnchantedCropCollectionAmount(crop, 1);
				default:
					return 160 * getEnchantedCropCollectionAmount(crop, 1);
			}
		default:
			return 0;
	}
}
