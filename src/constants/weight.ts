import { Crop } from './crops.js';

// https://api.elitebot.dev/weights
export const CROP_WEIGHT: Record<Crop, number> = {
	[Crop.Cactus]: 177_254.45,
	[Crop.Carrot]: 302_061.86,
	[Crop.CocoaBeans]: 267_174.04,
	[Crop.Melon]: 485_308.47,
	[Crop.Mushroom]: 90_178.06,
	[Crop.NetherWart]: 250_000,
	[Crop.Potato]: 300_000,
	[Crop.Pumpkin]: 98_284.71,
	[Crop.SugarCane]: 200_000,
	[Crop.Wheat]: 100_000,
	[Crop.Seeds]: 0, // Byproduct of wheat farming, not counted
};

export const TIER_12_MINIONS: readonly string[] = [
	'WHEAT_12',
	'CARROT_12',
	'POTATO_12',
	'PUMPKIN_12',
	'MELON_12',
	'MUSHROOM_12',
	'COCOA_12',
	'CACTUS_12',
	'SUGAR_CANE_12',
	'NETHER_WARTS_12',
] as const;

export const BONUS_WEIGHT = {
	Farming60Bonus: 250,
	Farming50Bonus: 100,
	AnitaBuffBonusMultiplier: 2,
	GoldMedalRewardInterval: 50,
	MinionRewardTier: 12,
	MinionRewardWeight: 5,
	MaxMedalsCounted: 1000,
	WeightPerDiamondMedal: 0.75,
	WeightPerPlatinumMedal: 0.5,
	WeightPerGoldMedal: 0.25,
} as const;
