import { ITEM_IDS } from './itemids.js';
import { Stat } from './stats.js';
import type { UpgradeCost } from './upgrades.js';

export enum Crop {
	Cactus = 'CACTUS',
	Carrot = 'CARROT_ITEM',
	CocoaBeans = 'INK_SACK:3',
	Melon = 'MELON',
	Mushroom = 'MUSHROOM_COLLECTION',
	NetherWart = 'NETHER_STALK',
	Potato = 'POTATO_ITEM',
	Pumpkin = 'PUMPKIN',
	SugarCane = 'SUGAR_CANE',
	Wheat = 'WHEAT',
	Seeds = 'WHEAT_SEEDS',
	Sunflower = 'DOUBLE_PLANT',
	Moonflower = 'MOONFLOWER',
	WildRose = 'WILD_ROSE',
}

export interface CropCraft {
	item: string;
	amount?: number;
	takes: number;
	and?: {
		item: string;
		amount: number;
		cost?: number;
	}[];
}

export interface CropRngDrop {
	chance: number;
	drops: Record<string, number>;
	/**
	 * If `harvestFeast`, this drop only occurs when a Harvest Feast is active and this crop is in-season.
	 * Used for Seasoning + per-crop Harvest Feast materials.
	 */
	only?: 'harvestFeast';
}

export interface CropInfo {
	name: string;
	npc: number;
	drops: number;
	fortuneType: Stat;
	breaks?: number;
	replenish?: boolean;
	exportable?: boolean;
	exportableCost?: UpgradeCost;
	startingTool: string;
	toolXpFactor: number;
	crafts: CropCraft[];
	rng?: CropRngDrop[];
}

/** Drop chance of Seasoning from any in-season crop during a Harvest Feast (1/2,250). */
export const HARVEST_FEAST_SEASONING_CHANCE = 1 / 2_250;

/** Drop chance of a per-crop Harvest Feast unique material from in-season crops (1/18,000). */
export const HARVEST_FEAST_MATERIAL_CHANCE = 1 / 18_000;

/** Per-crop unique Harvest Feast material item id, dropped at 1/18,000 from in-season crops. */
export const HARVEST_FEAST_MATERIALS: Partial<Record<Crop, string>> = {
	[Crop.Wheat]: 'CORNUCOPIA',
	[Crop.Carrot]: 'CARROT_ZEST',
	[Crop.Potato]: 'DEEPFRIES',
	[Crop.Pumpkin]: 'AGGOURDIAN',
	[Crop.SugarCane]: 'CANE_KNOT',
	[Crop.Melon]: 'MELON_JUICE',
	[Crop.Cactus]: 'CACTUS_FLOWER',
	[Crop.CocoaBeans]: 'DESIGNER_COFFEE_BEANS',
	[Crop.Mushroom]: 'FEASTFUNGUS',
	[Crop.NetherWart]: 'BOTROOT',
	[Crop.Sunflower]: 'SALTED_SUNFLOWER_SEEDS',
	[Crop.Moonflower]: 'CRYSTALIZED_MOONLIGHT',
	[Crop.WildRose]: 'FLORAL_GELATIN',
};

function harvestFeastDrops(crop: Crop): CropRngDrop[] {
	const material = HARVEST_FEAST_MATERIALS[crop];
	const entries: CropRngDrop[] = [
		{
			chance: HARVEST_FEAST_SEASONING_CHANCE,
			drops: { SEASONING: 1 },
			only: 'harvestFeast',
		},
	];
	if (material) {
		entries.push({
			chance: HARVEST_FEAST_MATERIAL_CHANCE,
			drops: { [material]: 1 },
			only: 'harvestFeast',
		});
	}
	return entries;
}

export const CROP_INFO: Record<Crop, CropInfo> = {
	[Crop.Cactus]: {
		name: 'Cactus',
		npc: 4,
		drops: 2,
		breaks: 2,
		toolXpFactor: 1.5,
		fortuneType: Stat.CactusFortune,
		exportable: true,
		exportableCost: {
			items: {
				POTTED_CACTUS: 3000,
			},
		},
		startingTool: 'CACTUS_KNIFE',
		crafts: [
			{
				item: 'ENCHANTED_CACTUS_GREEN',
				takes: 160,
			},
			{
				item: 'ENCHANTED_CACTUS',
				takes: 160 * 160,
			},
		],
		rng: harvestFeastDrops(Crop.Cactus),
	},
	[Crop.Carrot]: {
		name: 'Carrot',
		npc: 3,
		drops: 3,
		toolXpFactor: 3.5,
		fortuneType: Stat.CarrotFortune,
		replenish: true,
		exportable: true,
		exportableCost: {
			items: {
				EXPORTABLE_CARROTS: 3000,
			},
		},
		startingTool: 'THEORETICAL_HOE_CARROT_1',
		crafts: [
			{
				item: 'ENCHANTED_CARROT',
				takes: 160,
			},
			{
				item: 'ENCHANTED_GOLDEN_CARROT',
				takes: 160 * 160,
			},
		],
		rng: harvestFeastDrops(Crop.Carrot),
	},
	[Crop.CocoaBeans]: {
		name: 'Cocoa Beans',
		npc: 3,
		drops: 3,
		toolXpFactor: 1.5,
		fortuneType: Stat.CocoaBeanFortune,
		replenish: true,
		exportable: true,
		exportableCost: {
			items: {
				SUPREME_CHOCOLATE_BAR: 3000,
			},
		},
		startingTool: 'COCO_CHOPPER',
		crafts: [
			{
				item: 'ENCHANTED_COCOA',
				takes: 160,
			},
			{
				item: 'ENCHANTED_COOKIE',
				takes: 160 * 160,
			},
		],
		rng: harvestFeastDrops(Crop.CocoaBeans),
	},
	[Crop.Melon]: {
		name: 'Melon',
		npc: 2,
		drops: 5,
		toolXpFactor: 4,
		fortuneType: Stat.MelonFortune,
		startingTool: 'MELON_DICER',
		crafts: [
			{
				item: 'ENCHANTED_MELON',
				takes: 160,
			},
			{
				item: 'ENCHANTED_MELON_BLOCK',
				takes: 160 * 160,
			},
		],
		rng: harvestFeastDrops(Crop.Melon),
	},
	[Crop.Mushroom]: {
		name: 'Mushroom',
		npc: 10,
		drops: 1,
		toolXpFactor: 0.95,
		exportable: true,
		fortuneType: Stat.MushroomFortune,
		exportableCost: {
			items: {
				HALF_EATEN_MUSHROOM: 3000,
			},
		},
		startingTool: 'FUNGI_CUTTER',
		crafts: [
			{
				item: ITEM_IDS.EnchantedBrownMushroom,
				takes: 160,
			},
			{
				item: ITEM_IDS.EnchantedBrownMushroomBlock,
				takes: 160 * 160,
			},
			{
				item: ITEM_IDS.EnchantedRedMushroom,
				takes: 160,
			},
			{
				item: ITEM_IDS.EnchantedRedMushroomBlock,
				takes: 160 * 160,
			},
		],
		rng: [
			{
				// Burrowing Spores rate buffed in Harvest Feast update from 1/250,000 to 1/350,000
				// to compensate for it now being affected by RARE CROP chance (Overbloom).
				chance: 1 / 350_000,
				drops: {
					BURROWING_SPORES: 1,
				},
			},
			...harvestFeastDrops(Crop.Mushroom),
		],
	},
	[Crop.NetherWart]: {
		name: 'Nether Wart',
		npc: 4,
		drops: 2.5,
		toolXpFactor: 3,
		replenish: true,
		exportable: true,
		fortuneType: Stat.NetherWartFortune,
		exportableCost: {
			items: {
				WARTY: 3000,
			},
		},
		startingTool: 'THEORETICAL_HOE_WARTS_1',
		crafts: [
			{
				item: ITEM_IDS.EnchantedNetherWart,
				takes: 160,
			},
			{
				item: ITEM_IDS.MutantNetherWart,
				takes: 160 * 160,
			},
		],
		rng: harvestFeastDrops(Crop.NetherWart),
	},
	[Crop.Potato]: {
		name: 'Potato',
		npc: 3,
		drops: 3,
		toolXpFactor: 3,
		replenish: true,
		fortuneType: Stat.PotatoFortune,
		startingTool: 'THEORETICAL_HOE_POTATO_1',
		crafts: [
			{
				item: 'ENCHANTED_POTATO',
				takes: 160,
			},
			{
				item: 'ENCHANTED_BAKED_POTATO',
				takes: 160 * 160,
			},
		],
		rng: harvestFeastDrops(Crop.Potato),
	},
	[Crop.Pumpkin]: {
		name: 'Pumpkin',
		npc: 10,
		drops: 1,
		toolXpFactor: 0.85,
		exportable: true,
		fortuneType: Stat.PumpkinFortune,
		exportableCost: {
			items: {
				EXPIRED_PUMPKIN: 3000,
			},
		},
		startingTool: 'PUMPKIN_DICER',
		crafts: [
			{
				item: 'ENCHANTED_PUMPKIN',
				takes: 160,
			},
			{
				item: 'POLISHED_PUMPKIN',
				takes: 160 * 160,
			},
		],
		rng: harvestFeastDrops(Crop.Pumpkin),
	},
	[Crop.SugarCane]: {
		name: 'Sugar Cane',
		npc: 4,
		drops: 2,
		breaks: 2,
		toolXpFactor: 2,
		fortuneType: Stat.SugarCaneFortune,
		startingTool: 'THEORETICAL_HOE_CANE_1',
		crafts: [
			{
				item: 'ENCHANTED_SUGAR',
				takes: 160,
			},
			{
				item: 'ENCHANTED_SUGAR_CANE',
				takes: 160 * 160,
			},
		],
		rng: harvestFeastDrops(Crop.SugarCane),
	},
	[Crop.Wheat]: {
		name: 'Wheat',
		npc: 6,
		drops: 1,
		toolXpFactor: 1,
		exportable: true,
		fortuneType: Stat.WheatFortune,
		exportableCost: {
			items: {
				FINE_FLOUR: 3000,
			},
		},
		startingTool: 'THEORETICAL_HOE_WHEAT_1',
		crafts: [
			{
				item: 'ENCHANTED_WHEAT',
				takes: 160,
			},
			{
				item: 'ENCHANTED_HAY_BALE',
				takes: 160 * 160,
			},
		],
		rng: harvestFeastDrops(Crop.Wheat),
	},
	[Crop.Seeds]: {
		name: 'Seeds',
		npc: 3,
		drops: 1.5,
		toolXpFactor: 1,
		replenish: true,
		fortuneType: Stat.WheatFortune,
		startingTool: 'THEORETICAL_HOE_WHEAT_1',
		crafts: [
			{
				item: 'ENCHANTED_SEEDS',
				takes: 160,
			},
			{
				item: 'BOX_OF_SEEDS',
				takes: 160 * 160,
			},
		],
	},
	[Crop.Sunflower]: {
		name: 'Sunflower',
		npc: 4,
		drops: 2,
		toolXpFactor: 2,
		fortuneType: Stat.SunflowerFortune,
		replenish: true,
		startingTool: 'THEORETICAL_HOE_SUNFLOWER_1',
		crafts: [
			{
				item: 'ENCHANTED_SUNFLOWER',
				takes: 160,
			},
			{
				item: 'COMPACTED_SUNFLOWER',
				takes: 160 * 160,
			},
		],
		rng: harvestFeastDrops(Crop.Sunflower),
	},
	[Crop.Moonflower]: {
		name: 'Moonflower',
		npc: 4,
		drops: 2,
		toolXpFactor: 2,
		fortuneType: Stat.MoonflowerFortune,
		replenish: true,
		startingTool: 'THEORETICAL_HOE_SUNFLOWER_1', // Same as sunflower
		crafts: [
			{
				item: 'ENCHANTED_MOONFLOWER',
				takes: 160,
			},
			{
				item: 'COMPACTED_MOONFLOWER',
				takes: 160 * 160,
			},
		],
		rng: harvestFeastDrops(Crop.Moonflower),
	},
	[Crop.WildRose]: {
		name: 'Wild Rose',
		npc: 4,
		drops: 2,
		toolXpFactor: 1.5,
		fortuneType: Stat.WildRoseFortune,
		replenish: true,
		exportable: true,
		exportableCost: {
			items: {
				PRICKLY_KISS: 3000,
			},
		},
		startingTool: 'THEORETICAL_HOE_WILD_ROSE_1',
		crafts: [
			{
				item: 'ENCHANTED_WILD_ROSE',
				takes: 160,
			},
			{
				item: 'COMPACTED_WILD_ROSE',
				takes: 160 * 160,
			},
		],
		rng: harvestFeastDrops(Crop.WildRose),
	},
};

// TODO: Calculate this from the list of sources
// Base plus crop specific fortune
// Does not include temporary fortune sources
export const MAX_CROP_FORTUNE: Record<Crop, number> = {
	[Crop.Cactus]: 2629.28 + 12,
	[Crop.Carrot]: 2629.28 + 12,
	[Crop.CocoaBeans]: 2629.28 + 37,
	[Crop.Melon]: 2629.28,
	[Crop.Mushroom]: 2629.28 + 12,
	[Crop.NetherWart]: 2629.28 + 12,
	[Crop.Potato]: 2629.28,
	[Crop.Pumpkin]: 2629.28 + 12,
	[Crop.SugarCane]: 2629.28,
	[Crop.Wheat]: 2629.28 + 12,
	[Crop.Seeds]: 2629.28 + 12,
	[Crop.Sunflower]: 2629.28,
	[Crop.Moonflower]: 2629.28,
	[Crop.WildRose]: 2629.28 + 12,
};

export const LIST_OF_CROPS: Exclude<Crop, Crop.Seeds>[] = [
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
	Crop.Sunflower,
	Crop.Moonflower,
	Crop.WildRose,
];

export const LIST_OF_CROPS_WITH_SEEDS: Crop[] = [...LIST_OF_CROPS, Crop.Seeds];

export const EXPORTABLE_CROP_FORTUNE = 12;
