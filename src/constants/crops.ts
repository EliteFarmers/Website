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
	crafts: CropCraft[];
	rng?: { chance: number; drops: Record<string, number> }[];
}

export const CROP_INFO: Record<Crop, CropInfo> = {
	[Crop.Cactus]: {
		name: 'Cactus',
		npc: 4,
		drops: 2,
		breaks: 2,
		fortuneType: Stat.CactusFortune,
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
	},
	[Crop.Carrot]: {
		name: 'Carrot',
		npc: 3,
		drops: 3,
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
				takes: 128 * 160,
				and: [
					{
						item: 'GOLDEN_CARROT',
						amount: 32,
						cost: 15,
					},
				],
			},
		],
	},
	[Crop.CocoaBeans]: {
		name: 'Cocoa Beans',
		npc: 3,
		drops: 3,
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
				takes: 128 * 160,
				and: [
					{
						item: Crop.Wheat,
						cost: 6,
						amount: 32,
					},
				],
			},
		],
	},
	[Crop.Melon]: {
		name: 'Melon',
		npc: 2,
		drops: 5,
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
	},
	[Crop.Mushroom]: {
		name: 'Mushroom',
		npc: 10,
		drops: 1,
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
				item: 'ENCHANTED_BROWN_MUSHROOM',
				takes: 160,
			},
			{
				item: 'ENCHANTED_HUGE_MUSHROOM_1',
				takes: 160 * 32,
			},
			{
				item: 'ENCHANTED_RED_MUSHROOM',
				takes: 160,
			},
			{
				item: 'ENCHANTED_HUGE_MUSHROOM_2',
				takes: 160 * 32,
			},
		],
		rng: [
			{
				chance: 1 / 250_000,
				drops: {
					BURROWING_SPORES: 1,
				},
			},
		],
	},
	[Crop.NetherWart]: {
		name: 'Nether Wart',
		npc: 4,
		drops: 2.5,
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
				item: 'ENCHANTED_NETHER_STALK',
				takes: 160,
			},
			{
				item: 'MUTANT_NETHER_STALK',
				takes: 160 * 160,
			},
		],
	},
	[Crop.Potato]: {
		name: 'Potato',
		npc: 3,
		drops: 3,
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
	},
	[Crop.Pumpkin]: {
		name: 'Pumpkin',
		npc: 10,
		drops: 1,
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
	},
	[Crop.SugarCane]: {
		name: 'Sugar Cane',
		npc: 4,
		drops: 2,
		breaks: 2,
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
	},
	[Crop.Wheat]: {
		name: 'Wheat',
		npc: 6,
		drops: 1,
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
	},
	[Crop.Seeds]: {
		name: 'Seeds',
		npc: 3,
		drops: 1.5,
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
};

// TODO: Calculate this from a list of sources
// Base plus pb fortune
export const MAX_CROP_FORTUNE: Record<Crop, number> = {
	[Crop.Cactus]: 1824,
	[Crop.Carrot]: 2053,
	[Crop.CocoaBeans]: 1886,
	[Crop.Melon]: 1854,
	[Crop.Mushroom]: 1870,
	[Crop.NetherWart]: 2053,
	[Crop.Potato]: 2041,
	[Crop.Pumpkin]: 1866,
	[Crop.SugarCane]: 2041,
	[Crop.Wheat]: 2053,
	[Crop.Seeds]: 2053, // Not a crop, same as wheat
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
];

export const LIST_OF_CROPS_WITH_SEEDS: Crop[] = [...LIST_OF_CROPS, Crop.Seeds];

export const EXPORTABLE_CROP_FORTUNE = 12;
