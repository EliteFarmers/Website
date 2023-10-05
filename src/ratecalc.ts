import { CROP_INFO, Crop, CropInfo } from './constants/crops';

interface CalculateDropsOptions {
	farmingFortune: number;
	blocksBroken: number;
}

export function CalculateAverageDrops(options: CalculateDropsOptions): Record<Crop, number> {
	const { farmingFortune, blocksBroken } = options;

	const result: Record<Crop, number> = {
		[Crop.Cactus]: 0,
		[Crop.Carrot]: 0,
		[Crop.CocoaBeans]: 0,
		[Crop.Melon]: 0,
		[Crop.Mushroom]: 0,
		[Crop.NetherWart]: 0,
		[Crop.Potato]: 0,
		[Crop.Pumpkin]: 0,
		[Crop.SugarCane]: 0,
		[Crop.Wheat]: 0,
		[Crop.Seeds]: 0,
	};

	for (const crop of Object.keys(result) as Crop[]) {
		result[crop] = CalculateExpectedDrops({
			farmingFortune,
			crop: crop,
			blocksBroken,
		});
	}

	return result;
}

interface CalculateExpectedDropsOptions extends CalculateDropsOptions {
	blocksBroken: number;
	crop: Crop;
}

export function CalculateExpectedDrops(options: CalculateExpectedDropsOptions): number {
	const { farmingFortune, blocksBroken, crop } = options;

	if (farmingFortune <= 0 || blocksBroken < 0) return 0;

	const { drops } = GetCropInfo(crop);
	if (!drops) return 0;

	switch (crop) {
		case Crop.Cactus:
		case Crop.Carrot:
		case Crop.CocoaBeans:
		case Crop.Mushroom:
		case Crop.NetherWart:
		case Crop.Potato:
		case Crop.SugarCane:
		case Crop.Wheat:
		case Crop.Seeds:
			return blocksBroken * drops * (farmingFortune * 0.1);
		case Crop.Pumpkin:
			return blocksBroken * drops * (farmingFortune * 0.1) * 0.5;
		case Crop.Melon:
			return blocksBroken * drops * (farmingFortune * 0.1) * 0.5;
		default:
			return 0;
	}
}

export function GetCropInfo(crop: Crop): CropInfo {
	return CROP_INFO[crop] ?? {};
}
