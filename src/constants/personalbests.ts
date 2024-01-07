import { Crop } from './crops';

export function FortuneFromPersonalBestContest(crop: Crop, personalBest: number) {
	const cropsPerTier = PERSONAL_BESTS_CROPS_PER_TIER[crop];
	const tiers = Math.floor(personalBest / cropsPerTier);

	return Math.min(tiers * PERSONAL_BEST_FORTUNE_PER_TIER, 100);
}

export const PERSONAL_BEST_FORTUNE_PER_TIER = 0.1;
export const PERSONAL_BESTS_CROPS_PER_TIER: Record<Crop, number> = {
	[Crop.Wheat]: 1_000,
	[Crop.Carrot]: 3_000,
	[Crop.Potato]: 3_000,
	[Crop.Pumpkin]: 1_000,
	[Crop.Melon]: 5_000,
	[Crop.Mushroom]: 1_000,
	[Crop.Cactus]: 2_000,
	[Crop.SugarCane]: 2_000,
	[Crop.NetherWart]: 3_000,
	[Crop.CocoaBeans]: 3_000,
	[Crop.Seeds]: 0, // Just for type safety
};
