export enum FarmingMechanic {
	CropGrowth = 'crop_growth',
	SprayonatorMaterialChance = 'sprayonator_material_chance',
	EnchantedCropChance = 'enchanted_crop_chance',
	AtmosphericFilterEffect = 'atmospheric_filter_effect',
	PestCooldownReductionSeconds = 'pest_cooldown_reduction_seconds',
}

export interface FarmingMechanicInfo {
	name: string;
	icon: string;
}

export const FARMING_MECHANIC_INFO: Record<FarmingMechanic, FarmingMechanicInfo> = {
	[FarmingMechanic.CropGrowth]: { name: 'Crop Growth', icon: '☀' },
	[FarmingMechanic.SprayonatorMaterialChance]: {
		name: 'Sprayonator Material Chance',
		icon: '%',
	},
	[FarmingMechanic.EnchantedCropChance]: {
		name: 'Enchanted Crop Chance',
		icon: '%',
	},
	[FarmingMechanic.AtmosphericFilterEffect]: {
		name: 'Atmospheric Filter Effect',
		icon: '%',
	},
	[FarmingMechanic.PestCooldownReductionSeconds]: {
		name: 'Pest Cooldown Reduction',
		icon: 's',
	},
};
