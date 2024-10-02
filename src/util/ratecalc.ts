import { CROP_INFO, Crop, CropInfo, MAX_CROP_FORTUNE } from '../constants/crops.js';
import { REFORGES, Rarity } from '../constants/reforges.js';
import { Stat } from "../constants/stats.js";
import { BEST_FARMING_TOOLS } from '../items/tools.js';
import { calculateMelonPerkBonus } from '../crops/melon.js';
import { calculatePumpkinPerkBonus } from '../crops/pumpkin.js';
import { calculateAverageSpecialCrops } from '../crops/special.js';

interface CalculateDropsOptions {
	farmingFortune?: number;
	blocksBroken: number;
	dicerLevel?: 1 | 2 | 3;
	armorPieces?: 1 | 2 | 3 | 4;
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
] as const;

export function calculateAverageDrops(options: CalculateDropsOptions): Record<Crop, number> {
	const result = {} as Record<Crop, number>;

	for (const crop of crops) {
		result[crop] = calculateExpectedDrops({
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

export function calculateDetailedAverageDrops(options: CalculateDetailedDropsOptions): Record<Crop, DetailedDrops> {
	const result = {} as Record<Crop, DetailedDrops>;

	for (const crop of crops) {
		result[crop] = calculateDetailedDrops({
			crop: crop,
			...options,
		});
	}

	const wheat = result[Crop.Wheat];
	const seeds = result[Crop.Seeds];

	// Combine seeds into wheat
	const seedCollection = seeds.collection - options.blocksBroken;
	wheat.otherCollection['Seeds'] = seedCollection;
	wheat.coinSources['Seeds'] = seedCollection * CROP_INFO[Crop.Seeds].npc;
	if (options.bountiful) {
		wheat.coinSources['Bountiful (Seeds)'] = seeds.coinSources['Bountiful'] ?? 0;
	}
	wheat.npcCoins = Object.values(wheat.coinSources).reduce((a, b) => a + b, 0);

	// Count mooshroom mushrooms as normal mushroom collection
	if (options.mooshroom) {
		const mushroom = result[Crop.Mushroom];
		const mooshroom = mushroom.otherCollection['Mushroom'] ?? 0;

		mushroom.collection += mooshroom;
		mushroom.otherCollection['Mooshroom'] = mooshroom;
		delete mushroom.otherCollection['Mushroom'];
	}

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

export function calculateExpectedDrops(options: CalculateExpectedDropsOptions): number {
	const { farmingFortune, blocksBroken, crop } = options;

	const fortune = farmingFortune ?? MAX_CROP_FORTUNE[crop] ?? 0;

	if (fortune <= 0 || blocksBroken < 0) return 0;

	const { drops } = getCropInfo(crop);
	if (!drops) return 0;

	const baseDrops = blocksBroken * drops * ((fortune + 100) * 0.01);
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
			return Math.round(baseDrops + calculatePumpkinPerkBonus(blocksBroken, options.dicerLevel));
		case Crop.Melon:
			return Math.round(baseDrops + calculateMelonPerkBonus(blocksBroken, options.dicerLevel));
		default:
			return 0;
	}
}

export function calculateDetailedDrops(options: CalculateCropDetailedDropsOptions): DetailedDrops {
	const result = {
		collection: 0,
		npcCoins: 0,
		fortune: 0,
		coinSources: {} as Record<string, number>,
		otherCollection: {} as Record<string, number>,
	};

	const { farmingFortune, blocksBroken, crop, bountiful, armorPieces = 4 } = options;

	result.fortune = farmingFortune ?? MAX_CROP_FORTUNE[crop] ?? 0;
	let fortune =  result.fortune + 100;
	
	if (fortune <= 0 || blocksBroken < 0) return result;

	if (!bountiful && !farmingFortune) {
		// Add the difference in farming fortune if the user has blessed instead of bountiful
		const maxRarity = BEST_FARMING_TOOLS[crop]?.maxRarity ?? Rarity.Mythic;
		const bountifulFortune = REFORGES.bountiful?.tiers[maxRarity]?.stats?.[Stat.FarmingFortune] ?? 0;
		const blessedFortune = REFORGES.blessed?.tiers[maxRarity]?.stats?.[Stat.FarmingFortune] ?? 0;

		fortune += blessedFortune - bountifulFortune;
	}

	const { drops, npc, breaks = 1, replenish = false } = getCropInfo(crop);
	if (!drops) return result;

	const baseDrops = blocksBroken * drops * (fortune * 0.01);
	result.otherCollection['Normal'] = Math.round(baseDrops);

	// Coin sources
	if (bountiful) {
		result.coinSources['Bountiful'] = Math.round(baseDrops * 0.2);
	}

	if (options.mooshroom) {
		const mushroomDrops = Math.round(blocksBroken * breaks);
		result.coinSources['Mooshroom'] = mushroomDrops * CROP_INFO[Crop.Mushroom].npc;
		result.otherCollection['Mushroom'] = mushroomDrops;
	}

	const specialCrops = calculateAverageSpecialCrops(blocksBroken, crop, armorPieces);

	result.otherCollection[specialCrops.type] = Math.round(specialCrops.amount);
	result.coinSources[specialCrops.type] = Math.round(specialCrops.npc);

	let extraDrops = 0;
	switch (crop) {
		case Crop.Pumpkin:
			extraDrops = Math.round(calculatePumpkinPerkBonus(blocksBroken, options.dicerLevel));
			result.coinSources['Dicer RNG'] = Math.round(extraDrops * npc);
			result.coinSources['Collection'] = Math.round(baseDrops * npc);
			result.otherCollection['RNG Pumpkin'] = Math.round(extraDrops);
			result.collection = Math.round(baseDrops + extraDrops);
			break;
		case Crop.Melon:
			extraDrops = Math.round(calculateMelonPerkBonus(blocksBroken, options.dicerLevel));
			result.coinSources['Dicer RNG'] = Math.round(extraDrops * npc);
			result.coinSources['Collection'] = Math.round(baseDrops * npc);
			result.otherCollection['RNG Melon'] = Math.round(extraDrops);
			result.collection = Math.round(baseDrops + extraDrops);
			break;
		default:
			if (replenish) {
				// Replenish takes away one drop per block broken
				result.coinSources['Collection'] = Math.round((baseDrops - blocksBroken * breaks) * npc);
				result.otherCollection['Replenish'] = -Math.round(blocksBroken * breaks);
				result.collection = Math.round(baseDrops);
				break;
			}

			result.coinSources['Collection'] = Math.round(baseDrops * npc);
			result.collection = Math.round(baseDrops);
			break;
	}

	result.npcCoins = Object.values(result.coinSources).reduce((a, b) => a + b, 0);

	return result;
}

export interface FortuneRequiredCalculatorOptions {
	blocksBroken: number;
	crop: Crop;
	collection: number;
	useDicers?: boolean;
	useMooshroom?: boolean;
}

export function getFortuneRequiredForCollection(options: FortuneRequiredCalculatorOptions): number {
	const { blocksBroken, crop, useDicers, useMooshroom } = options;
	let { collection } = options;

	const { drops } = getCropInfo(options.crop);

	if (useDicers)
		switch (crop) {
			case Crop.Pumpkin:
				collection -= calculatePumpkinPerkBonus(blocksBroken);
				break;
			case Crop.Melon:
				collection -= calculateMelonPerkBonus(blocksBroken);
				break;
		}

	if (useMooshroom && crop === Crop.Mushroom) {
		collection -= blocksBroken; // "* breaks" not needed because it's always 1 for mushroom
	}

	const fortune = (collection * 100) / (drops * blocksBroken) - 100;
	return Math.ceil(fortune);
}

export function getNPCProfitFromCrops(crop: Crop, amount: number): number {
	const { npc } = getCropInfo(crop);
	if (!npc) return 0;
	return npc * amount;
}

export function getCropInfo(crop: Crop): CropInfo {
	return CROP_INFO[crop] ?? {};
}
