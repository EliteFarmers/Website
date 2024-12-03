import { Crop } from './crops.js';

// https://api.elitebot.dev/weights
export const CROP_WEIGHT: Record<Crop, number> = {
	[Crop.Cactus]: 178730.65,
	[Crop.Carrot]: 300000,
	[Crop.CocoaBeans]: 276733.75,
	[Crop.Melon]: 488435.88,
	[Crop.Mushroom]: 90944.27,
	[Crop.NetherWart]: 248606.81,
	[Crop.Potato]: 298328.17,
	[Crop.Pumpkin]: 99236.12,
	[Crop.SugarCane]: 198885.45,
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
