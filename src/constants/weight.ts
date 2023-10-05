import { Crop } from './crops';

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
