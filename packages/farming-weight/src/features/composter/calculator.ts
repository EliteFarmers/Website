import { ComposterUpgrade } from './composter.js';
import { getComposterStats } from './progress.js';

export interface ComposterMaterial {
	itemId: string;
	name: string;
	value: number;
	fixedPrice?: number;
}

export interface RankedComposterMaterial extends ComposterMaterial {
	unitPrice: number;
	coinsPerValue: number;
	itemsPerCycle: number;
	costPerCycle: number;
	fitsCapacity: boolean;
}

export type ComposterPriceMap = Partial<Record<string, number>>;

export interface ComposterCalculatorInput {
	upgradeLevels?: Partial<Record<ComposterUpgrade, number>>;
	organicMatter: ComposterMaterial;
	fuel: ComposterMaterial;
	organicMatterPrice?: number;
	fuelPrice?: number;
	compostPrice?: number;
}

export interface ComposterCalculatorResult {
	upgradeLevels: Record<ComposterUpgrade, number>;
	speedMultiplier: number;
	multiDropChance: number;
	costReduction: number;
	secondsPerCycle: number;
	cyclesPerHour: number;
	expectedCompostPerCycle: number;
	compostPerHour: number;
	compostPerDay: number;
	organicMatterPerCycle: number;
	fuelPerCycle: number;
	organicMatterPerHour: number;
	fuelPerHour: number;
	organicItemsPerHour: number;
	fuelItemsPerHour: number;
	organicMatterCapacity: number;
	fuelCapacity: number;
	organicMatterPerFullLoad: number;
	fuelPerFullLoad: number;
	unattendedHours: number;
	organicMatterFitsCapacity: boolean;
	organicCostPerDay?: number;
	fuelCostPerDay?: number;
	totalCostPerDay?: number;
	revenuePerDay?: number;
	profitPerDay?: number;
	costPerCompost?: number;
}

export const COMPOSTER_BASE_SECONDS_PER_CYCLE = 10 * 60;
export const COMPOSTER_BASE_ORGANIC_MATTER_PER_CYCLE = 4_000;
export const COMPOSTER_BASE_FUEL_PER_CYCLE = 2_000;
export const COMPOSTER_MAX_UPGRADE_LEVEL = 25;

export const COMPOSTER_ORGANIC_MATTER_ITEMS = [
	{ itemId: 'CROPIE', name: 'Cropie', value: 2_500 },
	{ itemId: 'SQUASH', name: 'Squash', value: 10_000 },
	{ itemId: 'FERMENTO', name: 'Fermento', value: 20_000 },
	{ itemId: 'CONDENSED_FERMENTO', name: 'Condensed Fermento', value: 180_000 },
	{ itemId: 'HELIANTHUS', name: 'Helianthus', value: 30_000 },
	{ itemId: 'CONDENSED_HELIANTHUS', name: 'Condensed Helianthus', value: 270_000 },
	{ itemId: 'ETHEREAL_VINE', name: 'Ethereal Vine', value: 5_000 },
	{ itemId: 'FLOWERING_BOUQUET', name: 'Flowering Bouquet', value: 6_000 },
	{ itemId: 'FINE_FLOUR', name: 'Fine Flour', value: 150 },
	// { itemId: 'WHEAT', name: 'Wheat', value: 1 },
	{ itemId: 'ENCHANTED_BREAD', name: 'Enchanted Bread', value: 60 },
	{ itemId: 'ENCHANTED_WHEAT', name: 'Enchanted Wheat', value: 160 },
	{ itemId: 'ENCHANTED_HAY_BALE', name: 'Enchanted Hay Bale', value: 25_600 },
	// { itemId: 'SEEDS', name: 'Seeds', value: 1 },
	{ itemId: 'ENCHANTED_SEEDS', name: 'Enchanted Seeds', value: 160 },
	{ itemId: 'BOX_OF_SEEDS', name: 'Box of Seeds', value: 25_600 },
	// { itemId: 'CARROT_ITEM', name: 'Carrot', value: 0.29 },
	{ itemId: 'ENCHANTED_CARROT', name: 'Enchanted Carrot', value: 46.4 },
	{ itemId: 'ENCHANTED_GOLDEN_CARROT', name: 'Enchanted Golden Carrot', value: 5_939.2 },
	// { itemId: 'POTATO_ITEM', name: 'Potato', value: 0.33 },
	{ itemId: 'POISONOUS_POTATO', name: 'Poisonous Potato', value: 0.33 },
	{ itemId: 'ENCHANTED_POTATO', name: 'Enchanted Potato', value: 52.8 },
	{ itemId: 'ENCHANTED_POISONOUS_POTATO', name: 'Enchanted Poisonous Potato', value: 52.8 },
	{ itemId: 'ENCHANTED_BAKED_POTATO', name: 'Enchanted Baked Potato', value: 8_448 },
	// { itemId: 'PUMPKIN', name: 'Pumpkin', value: 1 },
	{ itemId: 'ENCHANTED_PUMPKIN', name: 'Enchanted Pumpkin', value: 160 },
	{ itemId: 'POLISHED_PUMPKIN', name: 'Polished Pumpkin', value: 25_600 },
	// { itemId: 'MELON', name: 'Melon Slice', value: 0.2 },
	// { itemId: 'MELON_BLOCK', name: 'Melon', value: 1.8 },
	{ itemId: 'ENCHANTED_MELON', name: 'Enchanted Melon Slice', value: 32 },
	{ itemId: 'ENCHANTED_MELON_BLOCK', name: 'Enchanted Melon', value: 5_120 },
	// { itemId: 'RED_MUSHROOM', name: 'Red Mushroom', value: 1 },
	// { itemId: 'HUGE_MUSHROOM_2', name: 'Red Mushroom Block', value: 9 },
	{ itemId: 'ENCHANTED_RED_MUSHROOM', name: 'Enchanted Red Mushroom', value: 160 },
	{ itemId: 'ENCHANTED_HUGE_MUSHROOM_2', name: 'Enchanted Red Mushroom Block', value: 5_184 },
	// { itemId: 'BROWN_MUSHROOM', name: 'Brown Mushroom', value: 1 },
	// { itemId: 'HUGE_MUSHROOM_1', name: 'Brown Mushroom Block', value: 9 },
	{ itemId: 'ENCHANTED_BROWN_MUSHROOM', name: 'Enchanted Brown Mushroom', value: 160 },
	{ itemId: 'ENCHANTED_HUGE_MUSHROOM_1', name: 'Enchanted Brown Mushroom Block', value: 5_184 },
	// { itemId: 'INK_SACK:3', name: 'Cocoa Beans', value: 0.4 },
	{ itemId: 'ENCHANTED_COCOA', name: 'Enchanted Cocoa Beans', value: 64 },
	// { itemId: 'CACTUS', name: 'Cactus', value: 0.5 },
	// { itemId: 'INK_SACK:2', name: 'Cactus Green', value: 0.5 },
	{ itemId: 'ENCHANTED_CACTUS_GREEN', name: 'Enchanted Cactus Green', value: 80 },
	{ itemId: 'ENCHANTED_CACTUS', name: 'Enchanted Cactus', value: 12_800 },
	// { itemId: 'SUGAR_CANE', name: 'Sugar Cane', value: 0.5 },
	{ itemId: 'ENCHANTED_SUGAR', name: 'Enchanted Sugar', value: 80 },
	{ itemId: 'ENCHANTED_PAPER', name: 'Enchanted Paper', value: 96 },
	{ itemId: 'ENCHANTED_SUGAR_CANE', name: 'Enchanted Sugar Cane', value: 12_800 },
	// { itemId: 'NETHER_STALK', name: 'Nether Wart', value: 0.33 },
	{ itemId: 'ENCHANTED_NETHER_STALK', name: 'Enchanted Nether Wart', value: 52.8 },
	{ itemId: 'MUTANT_NETHER_STALK', name: 'Mutant Nether Wart', value: 8_448 },
] as const satisfies readonly ComposterMaterial[];

export const COMPOSTER_FUELS = [
	{ itemId: 'RED_THORNLEAF', name: 'Red Thornleaf', value: 200 },
	{ itemId: 'ENCHANTED_DANDELION', name: 'Enchanted Dandelion', value: 360 },
	{ itemId: 'ENCHANTED_POPPY', name: 'Enchanted Poppy', value: 1_024 },
	{ itemId: 'BIOFUEL', name: 'Biofuel', value: 3_000, fixedPrice: 20_000 },
	{ itemId: 'COALROOT', name: 'Coalroot', value: 5_000 },
	{ itemId: 'VOLTA', name: 'Volta', value: 10_000 },
	{ itemId: 'OIL_BARREL', name: 'Oil Barrel', value: 10_000 },
	{ itemId: 'SUNFLOWER_OIL', name: 'Sunflower Oil', value: 20_000 },
	{ itemId: 'HELIX', name: 'Helix Fossil', value: 50_000 },
	{ itemId: 'CLAW_FOSSIL', name: 'Claw Fossil', value: 50_000 },
	{ itemId: 'CLUBBED_FOSSIL', name: 'Clubbed Fossil', value: 50_000 },
	{ itemId: 'FOOTPRINT_FOSSIL', name: 'Footprint Fossil', value: 50_000 },
	{ itemId: 'SPINE_FOSSIL', name: 'Spine Fossil', value: 50_000 },
	{ itemId: 'TUSK_FOSSIL', name: 'Tusk Fossil', value: 50_000 },
	{ itemId: 'UGLY_FOSSIL', name: 'Ugly Fossil', value: 50_000 },
	{ itemId: 'WEBBED_FOSSIL', name: 'Webbed Fossil', value: 50_000 },
] as const satisfies readonly ComposterMaterial[];

const normalizeLevel = (level: number | undefined) =>
	Math.min(COMPOSTER_MAX_UPGRADE_LEVEL, Math.max(0, Math.floor(Number.isFinite(level) ? level! : 0)));

export function normalizeComposterUpgradeLevels(
	levels: Partial<Record<ComposterUpgrade, number>> = {}
): Record<ComposterUpgrade, number> {
	return {
		[ComposterUpgrade.Speed]: normalizeLevel(levels[ComposterUpgrade.Speed]),
		[ComposterUpgrade.MultiDrop]: normalizeLevel(levels[ComposterUpgrade.MultiDrop]),
		[ComposterUpgrade.FuelCap]: normalizeLevel(levels[ComposterUpgrade.FuelCap]),
		[ComposterUpgrade.OrganicMatterCap]: normalizeLevel(levels[ComposterUpgrade.OrganicMatterCap]),
		[ComposterUpgrade.CostReduction]: normalizeLevel(levels[ComposterUpgrade.CostReduction]),
	};
}

export function rankComposterMaterials(
	materials: readonly ComposterMaterial[],
	prices: ComposterPriceMap,
	requiredPerCycle: number,
	capacity = Number.POSITIVE_INFINITY
): RankedComposterMaterial[] {
	return materials
		.flatMap((material) => {
			const unitPrice = material.fixedPrice ?? prices[material.itemId];
			if (!Number.isFinite(unitPrice) || unitPrice! <= 0) return [];

			const itemsPerCycle = requiredPerCycle / material.value;
			return [
				{
					...material,
					unitPrice: unitPrice!,
					coinsPerValue: unitPrice! / material.value,
					itemsPerCycle,
					costPerCycle: itemsPerCycle * unitPrice!,
					fitsCapacity: material.value <= capacity,
				},
			];
		})
		.sort((a, b) => a.coinsPerValue - b.coinsPerValue || a.name.localeCompare(b.name));
}

export function calculateComposter(input: ComposterCalculatorInput): ComposterCalculatorResult {
	const upgradeLevels = normalizeComposterUpgradeLevels(input.upgradeLevels);
	const { stats } = getComposterStats(upgradeLevels);
	const speedMultiplier = 1 + stats[ComposterUpgrade.Speed];
	const multiDropChance = stats[ComposterUpgrade.MultiDrop];
	const costReduction = stats[ComposterUpgrade.CostReduction];
	const organicMatterCapacity = stats[ComposterUpgrade.OrganicMatterCap];
	const fuelCapacity = stats[ComposterUpgrade.FuelCap];

	const secondsPerCycle = COMPOSTER_BASE_SECONDS_PER_CYCLE / speedMultiplier;
	const cyclesPerHour = 3_600 / secondsPerCycle;
	const expectedCompostPerCycle = 1 + multiDropChance;
	const organicMatterPerCycle = COMPOSTER_BASE_ORGANIC_MATTER_PER_CYCLE * (1 - costReduction);
	const fuelPerCycle = COMPOSTER_BASE_FUEL_PER_CYCLE * (1 - costReduction);

	const compostPerHour = cyclesPerHour * expectedCompostPerCycle;
	const compostPerDay = compostPerHour * 24;
	const organicMatterPerHour = organicMatterPerCycle * cyclesPerHour;
	const fuelPerHour = fuelPerCycle * cyclesPerHour;
	const organicItemsPerHour = organicMatterPerHour / input.organicMatter.value;
	const fuelItemsPerHour = fuelPerHour / input.fuel.value;

	const organicMatterPerFullLoad =
		Math.floor(organicMatterCapacity / input.organicMatter.value) * input.organicMatter.value;
	const fuelPerFullLoad = Math.floor(fuelCapacity / input.fuel.value) * input.fuel.value;
	const unattendedHours = Math.min(organicMatterPerFullLoad / organicMatterPerHour, fuelPerFullLoad / fuelPerHour);
	const organicCostPerDay = validPrice(input.organicMatterPrice)
		? organicItemsPerHour * 24 * input.organicMatterPrice!
		: undefined;
	const fuelUnitPrice = input.fuel.fixedPrice ?? input.fuelPrice;
	const fuelCostPerDay = validPrice(fuelUnitPrice) ? fuelItemsPerHour * 24 * fuelUnitPrice! : undefined;
	const totalCostPerDay =
		organicCostPerDay === undefined || fuelCostPerDay === undefined
			? undefined
			: organicCostPerDay + fuelCostPerDay;
	const revenuePerDay = validPrice(input.compostPrice) ? compostPerDay * input.compostPrice! : undefined;
	const profitPerDay =
		totalCostPerDay === undefined || revenuePerDay === undefined ? undefined : revenuePerDay - totalCostPerDay;

	return {
		upgradeLevels,
		speedMultiplier,
		multiDropChance,
		costReduction,
		secondsPerCycle,
		cyclesPerHour,
		expectedCompostPerCycle,
		compostPerHour,
		compostPerDay,
		organicMatterPerCycle,
		fuelPerCycle,
		organicMatterPerHour,
		fuelPerHour,
		organicItemsPerHour,
		fuelItemsPerHour,
		organicMatterCapacity,
		fuelCapacity,
		organicMatterPerFullLoad,
		fuelPerFullLoad,
		unattendedHours,
		organicMatterFitsCapacity: input.organicMatter.value <= organicMatterCapacity,
		organicCostPerDay,
		fuelCostPerDay,
		totalCostPerDay,
		revenuePerDay,
		profitPerDay,
		costPerCompost: totalCostPerDay === undefined ? undefined : totalCostPerDay / compostPerDay,
	};
}

function validPrice(price: number | undefined): price is number {
	return Number.isFinite(price) && price! >= 0;
}
