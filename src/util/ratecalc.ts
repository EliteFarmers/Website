import { FARMING_ATTRIBUTE_SHARDS, type FarmingAttributes } from '../constants/attributes.js';
import { CROP_INFO, Crop, type CropInfo, MAX_CROP_FORTUNE } from '../constants/crops.js';
import { Rarity, REFORGES } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import { calculateMelonPerkBonus } from '../crops/melon.js';
import { calculatePumpkinPerkBonus } from '../crops/pumpkin.js';
import { calculateAverageSpecialCrops } from '../crops/special.js';
import { BEST_FARMING_TOOLS } from '../items/tools.js';

interface CalculateDropsOptions {
	farmingFortune?: number;
	cropFortune?: Record<Crop, number>;
	blocksBroken: number;
	dicerLevel?: 1 | 2 | 3;
	armorPieces?: 1 | 2 | 3 | 4;
	attributes?: FarmingAttributes | Record<string, number>;
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
	Crop.Sunflower,
	Crop.Moonflower,
	Crop.WildRose,
] as const;

type CropFortuneOption = { cropFortune?: Partial<Record<Crop, number>> };

export function calculateAverageDrops(options: CalculateDropsOptions & CropFortuneOption): Record<Crop, number> {
	const result = {} as Record<Crop, number>;

	for (const crop of crops) {
		const fortune = (options.cropFortune?.[crop] ?? 0) + (options.farmingFortune ?? 0);
		result[crop] = calculateExpectedDrops({
			crop: crop,
			...options,
			farmingFortune: fortune > 0 ? fortune : undefined,
		});
	}

	return result;
}

interface CalculateDetailedDropsOptions extends CalculateDropsOptions {
	bountiful: boolean;
	mooshroom: boolean;
}

export interface DetailedDropsResult {
	npcPrice: number;
	collection: number;
	npcCoins: number;
	fortune: number;
	blocksBroken: number;
	coinSources: Record<string, number>;
	otherCollection: Record<string, number>;
	items: Record<string, number>;
	rngItems?: Record<string, number>;
}

export function calculateDetailedAverageDrops(
	options: CalculateDetailedDropsOptions & CropFortuneOption
): Record<Crop, DetailedDropsResult> {
	const result = {} as Record<Crop, DetailedDropsResult>;

	for (const crop of crops) {
		const fortune = (options.cropFortune?.[crop] ?? 0) + (options.farmingFortune ?? 0);
		result[crop] = calculateDetailedDrops({
			crop: crop,
			...options,
			farmingFortune: fortune > 0 ? fortune : undefined,
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
	wheat.items[Crop.Seeds] = seedCollection;

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

export interface CalculateCropDetailedDropsOptions extends CalculateDetailedDropsOptions {
	blocksBroken: number;
	crop: Crop;
	infestedPlotProbability?: number;
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
		case Crop.Moonflower:
		case Crop.Sunflower:
		case Crop.WildRose:
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

export function calculateDetailedDrops(options: CalculateCropDetailedDropsOptions): DetailedDropsResult {
	const result: DetailedDropsResult = {
		npcPrice: 0,
		collection: 0,
		npcCoins: 0,
		fortune: 0,
		blocksBroken: options.blocksBroken,
		coinSources: {} as Record<string, number>,
		otherCollection: {} as Record<string, number>,
		items: {} as Record<string, number>,
	};

	const { farmingFortune, blocksBroken, crop, bountiful, armorPieces = 4 } = options;

	result.fortune = farmingFortune ?? MAX_CROP_FORTUNE[crop] ?? 0;
	let fortune = result.fortune + 100;

	if (fortune <= 0 || blocksBroken < 0) return result;

	if (!bountiful && !farmingFortune) {
		// Add the difference in farming fortune if the user has blessed instead of bountiful
		const maxRarity = BEST_FARMING_TOOLS[crop]?.maxRarity ?? Rarity.Mythic;
		const bountifulFortune = REFORGES.bountiful?.tiers[maxRarity]?.stats?.[Stat.FarmingFortune] ?? 0;
		const blessedFortune = REFORGES.blessed?.tiers[maxRarity]?.stats?.[Stat.FarmingFortune] ?? 0;

		fortune += blessedFortune - bountifulFortune;
	}

	const { drops, npc, breaks = 1, replenish = false, rng } = getCropInfo(crop);
	result.npcPrice = npc;

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
		result.items[Crop.Mushroom] = mushroomDrops;
	}

	const specialCrops = calculateAverageSpecialCrops(blocksBroken, crop, armorPieces);

	result.otherCollection[specialCrops.type] = Math.round(specialCrops.amount);
	result.items[specialCrops.id] = +specialCrops.amount.toFixed(2);
	result.coinSources[specialCrops.type] = Math.round(specialCrops.npc);

	let extraDrops = 0;
	switch (crop) {
		case Crop.Pumpkin:
			extraDrops = Math.round(calculatePumpkinPerkBonus(blocksBroken, options.dicerLevel));
			result.coinSources['Dicer RNG'] = Math.round(extraDrops * npc);
			result.coinSources['Collection'] = Math.round(baseDrops * npc);
			result.otherCollection['RNG Pumpkin'] = Math.round(extraDrops);
			result.collection = Math.round(baseDrops + extraDrops);
			result.items[Crop.Pumpkin] = Math.round(baseDrops + extraDrops);
			break;
		case Crop.Melon:
			extraDrops = Math.round(calculateMelonPerkBonus(blocksBroken, options.dicerLevel));
			result.coinSources['Dicer RNG'] = Math.round(extraDrops * npc);
			result.coinSources['Collection'] = Math.round(baseDrops * npc);
			result.otherCollection['RNG Melon'] = Math.round(extraDrops);
			result.collection = Math.round(baseDrops + extraDrops);
			result.items[Crop.Melon] = Math.round(baseDrops + extraDrops);
			break;
		default:
			if (replenish) {
				// Replenish takes away one drop per block broken
				result.coinSources['Collection'] = Math.round((baseDrops - blocksBroken * breaks) * npc);
				result.otherCollection['Replenish'] = -Math.round(blocksBroken * breaks);
				result.collection = Math.round(baseDrops);
				result.items[crop] = Math.round(baseDrops - blocksBroken * breaks);
				break;
			}

			result.coinSources['Collection'] = Math.round(baseDrops * npc);
			result.collection = Math.round(baseDrops);
			result.items[crop] = Math.round(baseDrops);
			break;
	}

	result.npcCoins = Object.values(result.coinSources).reduce((a, b) => a + b, 0);

	if (options.attributes) {
		for (const shard of Object.values(FARMING_ATTRIBUTE_SHARDS)) {
			if (shard.ratesModifier) {
				shard.ratesModifier(result, options);
			}
		}
	}

	if (rng) {
		for (const rngDrop of rng) {
			const drops = rngDrop.chance * blocksBroken;
			for (const [item, count] of Object.entries(rngDrop.drops)) {
				result.rngItems ??= {};
				result.rngItems[item] = count * drops + (result.rngItems[item] ?? 0);
			}
		}
	}

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

interface PossibleProfit {
	items: number;
	fractionalItems: number;
	remainder: number;
	cost: number;
	fractionalCost: number;
}

export function getPossibleResultsFromCrops(crop: Crop, amount: number): Record<string, PossibleProfit> {
	const { crafts } = getCropInfo(crop);

	return {
		[crop]: {
			items: amount,
			fractionalItems: amount,
			remainder: 0,
			cost: 0,
			fractionalCost: 0,
		},
		...crafts.reduce<Record<string, PossibleProfit>>((acc, curr) => {
			const items = Math.floor(amount / curr.takes);
			const remainder = amount % curr.takes;
			const cost = curr.and?.reduce((sum, curr) => sum + (curr.cost ?? 0) * curr.amount * items, 0);

			const fractionalItems = amount / curr.takes;
			const fractionalCost = curr.and?.reduce(
				(sum, curr) => sum + (curr.cost ?? 0) * curr.amount * fractionalItems,
				0
			);

			acc[curr.item] = {
				items,
				remainder,
				cost: cost ?? 0,
				fractionalItems,
				fractionalCost: fractionalCost ?? 0,
			};

			return acc;
		}, {}),
	};
}

export function getCropInfo(crop: Crop): CropInfo {
	return CROP_INFO[crop] ?? {};
}
