import { CROP_INFO, Crop, type CropInfo, MAX_CROP_FORTUNE } from '../constants/crops.js';

interface CalculateDropsOptions {
	farmingFortune?: number;
	cropFortune?: Record<Crop, number>;
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

interface CalculateExpectedDropsOptions extends CalculateDropsOptions {
	blocksBroken: number;
	crop: Crop;
}

export function calculateExpectedDrops(options: CalculateExpectedDropsOptions): number {
	const { farmingFortune, blocksBroken, crop } = options;

	const fortune = farmingFortune ?? MAX_CROP_FORTUNE[crop] ?? 0;

	if (fortune <= 0 || blocksBroken < 0) return 0;

	const { drops, replenish = false } = getCropInfo(crop);
	if (!drops) return 0;

	const baseDrops = blocksBroken * drops * ((fortune + 100) * 0.01);
	if (replenish) {
		// Replenish takes away one drop per block broken
		return Math.round(baseDrops - blocksBroken);
	}

	return Math.round(baseDrops);
}

export interface FortuneRequiredCalculatorOptions {
	blocksBroken: number;
	crop: Crop;
	collection: number;
	useMooshroom?: boolean;
}

export function getFortuneRequiredForCollection(options: FortuneRequiredCalculatorOptions): number {
	const { blocksBroken, crop, useMooshroom } = options;
	let { collection } = options;

	const { drops } = getCropInfo(options.crop);

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
