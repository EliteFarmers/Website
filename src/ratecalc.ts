import { CROP_INFO, Crop, CropInfo, MAX_CROP_FORTUNE } from './constants/crops';
import { MelonPerkBonus } from './crops/melon';
import { PumpkinPerkBonus } from './crops/pumpkin';
import { CalculateAverageSpecialCrops } from './crops/special';

interface CalculateDropsOptions {
	farmingFortune?: number;
	blocksBroken: number;
}

const crops = [
	Crop.Cactus,
	Crop.Carrot,
	Crop.CocoaBeans,
	Crop.Melon,
	Crop.Mushroom,
	Crop.NetherWart,
	Crop.Potato,
	Crop.Pumpkin,
	Crop.SugarCane,
	Crop.Wheat,
	Crop.Seeds,
];

export function CalculateAverageDrops(options: CalculateDropsOptions): Record<Crop, number> {
	const result = {} as Record<Crop, number>;

	for (const crop of crops) {
		result[crop] = CalculateExpectedDrops({
			crop: crop,
			...options,
		});
	}

	return result;
}

interface CalculateDetailedDropsOptions extends CalculateDropsOptions {
	bountiful: boolean;
	mooshroom: boolean;
}

interface DetailedDrops {
	collection: number;
	npcCoins: number;
	fortune: number;
	coinSources: Record<string, number>;
	otherCollection: Record<string, number>;
}

export function CalculateDetailedAverageDrops(options: CalculateDetailedDropsOptions): Record<Crop, DetailedDrops> {
	const result = {} as Record<Crop, DetailedDrops>;

	for (const crop of crops) {
		result[crop] = CalculateDetailedDrops({
			crop: crop,
			...options,
		});
	}

	const wheat = result[Crop.Wheat];
	const seeds = result[Crop.Seeds];

	wheat.otherCollection['Seeds'] = seeds.collection;
	wheat.coinSources['Seeds'] = seeds.collection * CROP_INFO[Crop.Seeds].npc;
	if (options.bountiful) {
		wheat.coinSources['Bountiful (Seeds)'] = seeds.coinSources['Bountiful'] ?? 0;
	}
	wheat.npcCoins = Object.values(wheat.coinSources).reduce((a, b) => a + b, 0);

	return result;
}

interface CalculateExpectedDropsOptions extends CalculateDropsOptions {
	blocksBroken: number;
	crop: Crop;
}

interface CalculateCropDetailedDropsOptions extends CalculateDetailedDropsOptions {
	blocksBroken: number;
	crop: Crop;
}

export function CalculateExpectedDrops(options: CalculateExpectedDropsOptions): number {
	const { farmingFortune, blocksBroken, crop } = options;

	const fortune = farmingFortune ?? MAX_CROP_FORTUNE[crop] ?? 0;

	if (fortune <= 0 || blocksBroken < 0) return 0;

	const { drops } = GetCropInfo(crop);
	if (!drops) return 0;

	const baseDrops = blocksBroken * drops * (fortune * 0.01);
	switch (crop) {
		case Crop.Cactus:
		case Crop.Wheat:
		case Crop.Mushroom:
		case Crop.SugarCane:
			return Math.round(baseDrops);
		case Crop.Carrot:
		case Crop.CocoaBeans:
		case Crop.NetherWart:
		case Crop.Potato:
		case Crop.Seeds:
			return Math.round(baseDrops - blocksBroken); // Replenish takes away one drop per block broken
		case Crop.Pumpkin:
			return Math.round(baseDrops + PumpkinPerkBonus(blocksBroken));
		case Crop.Melon:
			return Math.round(baseDrops + MelonPerkBonus(blocksBroken));
		default:
			return 0;
	}
}

export function CalculateDetailedDrops(options: CalculateCropDetailedDropsOptions): DetailedDrops {
	const result = {
		collection: 0,
		npcCoins: 0,
		fortune: 0,
		coinSources: {} as Record<string, number>,
		otherCollection: {} as Record<string, number>,
	};

	const { farmingFortune, blocksBroken, crop, bountiful } = options;

	let fortune = farmingFortune ?? MAX_CROP_FORTUNE[crop] ?? 0;
	if (fortune <= 0 || blocksBroken < 0) return result;

	if (!bountiful && !farmingFortune) {
		fortune += 5;
	}

	result.fortune = fortune;

	const { 
		drops, 
		npc, 
		breaks = 1, 
		replenish = false 
	} = GetCropInfo(crop);
	if (!drops) return result;

	const baseDrops = blocksBroken * drops * (fortune * 0.01);

	// Coin sources
	if (bountiful) {
		result.coinSources['Bountiful'] = Math.round(baseDrops * 0.2);
	}

	if (options.mooshroom) {
		result.coinSources['Mooshroom'] = Math.round(blocksBroken * breaks * CROP_INFO[Crop.Mushroom].npc);
		result.otherCollection['Mushroom'] = Math.round(blocksBroken * breaks);
	}

	const specialCrops = CalculateAverageSpecialCrops(blocksBroken, crop, 4);

	result.otherCollection[specialCrops.type] = Math.round(specialCrops.amount);
	result.coinSources[specialCrops.type] = Math.round(specialCrops.npc);

	let extraDrops = 0;
	switch (crop) {
		case Crop.Pumpkin:
			extraDrops = Math.round(PumpkinPerkBonus(blocksBroken));
			result.coinSources['Dicer RNG'] = Math.round(extraDrops * npc);
			result.collection = Math.round(baseDrops + extraDrops);
			result.coinSources['Collection'] = Math.round(result.collection * npc);
			break;
		case Crop.Melon:
			extraDrops = Math.round(MelonPerkBonus(blocksBroken));
			result.coinSources['Dicer RNG'] = Math.round(extraDrops * npc);
			result.collection = Math.round(baseDrops + extraDrops);
			result.coinSources['Collection'] = Math.round(result.collection * npc);
			break;
		default:
			if (replenish) {
				// Replenish takes away one drop per block broken
				result.coinSources['Collection'] = Math.round((baseDrops - blocksBroken * breaks) * npc);
				result.collection = Math.round(baseDrops - blocksBroken * breaks); 
				break;
			}

			result.coinSources['Collection'] = Math.round(baseDrops * npc);
			result.collection = Math.round(baseDrops);
			break;
	}

	result.npcCoins = Object.values(result.coinSources).reduce((a, b) => a + b, 0);

	return result;
}

export function GetNPCProfit(crop: Crop, amount: number): number {
	const { npc } = GetCropInfo(crop);
	if (!npc) return 0;
	return npc * amount;
}

export function GetCropInfo(crop: Crop): CropInfo {
	return CROP_INFO[crop] ?? {};
}
