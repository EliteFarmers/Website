import { CROP_INFO, Crop, CropInfo, MAX_CROP_FORTUNE } from './constants/crops';
import { MelonPerkBonus } from './crops/melon';
import { PumpkinPerkBonus } from './crops/pumpkin';

interface CalculateDropsOptions {
	farmingFortune?: number;
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

	const fortune = farmingFortune ?? MAX_CROP_FORTUNE[crop] ?? 0;

	if (fortune <= 0 || blocksBroken < 0) return 0;

	const { drops } = GetCropInfo(crop);
	if (!drops) return 0;

	const normal = blocksBroken * drops * (fortune * 0.1);
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
			return normal;
		case Crop.Pumpkin:
			return normal + PumpkinPerkBonus(blocksBroken);
		case Crop.Melon:
			return normal + MelonPerkBonus(blocksBroken);
		default:
			return 0;
	}
}

export function GetCropInfo(crop: Crop): CropInfo {
	return CROP_INFO[crop] ?? {};
}
