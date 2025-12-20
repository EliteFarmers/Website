import { Crop } from './crops.js';

export function fortuneFromPersonalBestContest(crop: Crop, personalBest: number) {
	const cropsPerTier = PERSONAL_BESTS_CROPS_PER_TIER[crop];
	const tiers = Math.floor(personalBest / cropsPerTier);

	return Math.min(tiers * PERSONAL_BEST_FORTUNE_PER_TIER, 100);
}

export const PERSONAL_BEST_FORTUNE_PER_TIER = 0.01;
export const PERSONAL_BESTS_CROPS_PER_TIER: Record<Crop, number> = {
	[Crop.Wheat]: 100,
	[Crop.Carrot]: 300,
	[Crop.Potato]: 300,
	[Crop.Pumpkin]: 100,
	[Crop.Melon]: 500,
	[Crop.Mushroom]: 100,
	[Crop.Cactus]: 200,
	[Crop.SugarCane]: 200,
	[Crop.NetherWart]: 300,
	[Crop.CocoaBeans]: 300,
	[Crop.Seeds]: 0,
	[Crop.Sunflower]: 200,
	[Crop.Moonflower]: 200,
	[Crop.WildRose]: 200,
};
