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

export interface CropInfo {
	name: string;
	npc: number;
	drops: number;
	breaks?: number;
	replenish?: boolean;
	exportable?: boolean;
}

export const CROP_INFO: Record<Crop, CropInfo> = {
	[Crop.Cactus]: {
		name: 'Cactus',
		npc: 3,
		drops: 2,
		breaks: 2,
	},
	[Crop.Carrot]: {
		name: 'Carrot',
		npc: 3,
		drops: 3,
		replenish: true,
		exportable: true,
	},
	[Crop.CocoaBeans]: {
		name: 'Cocoa Beans',
		npc: 3,
		drops: 3,
		replenish: true,
		exportable: true,
	},
	[Crop.Melon]: {
		name: 'Melon',
		npc: 2,
		drops: 5,
	},
	[Crop.Mushroom]: {
		name: 'Mushroom',
		npc: 10,
		drops: 1,
	},
	[Crop.NetherWart]: {
		name: 'Nether Wart',
		npc: 4,
		drops: 2.5,
		replenish: true,
	},
	[Crop.Potato]: {
		name: 'Potato',
		npc: 3,
		drops: 3,
		replenish: true,
	},
	[Crop.Pumpkin]: {
		name: 'Pumpkin',
		npc: 10,
		drops: 1,
		exportable: true,
	},
	[Crop.SugarCane]: {
		name: 'Sugar Cane',
		npc: 4,
		drops: 2,
		breaks: 2,
	},
	[Crop.Wheat]: {
		name: 'Wheat',
		npc: 6,
		drops: 1,
		exportable: true,
	},
	[Crop.Seeds]: {
		name: 'Seeds',
		npc: 3,
		drops: 1.5,
		replenish: true,
	},
};

// TODO: Calculate this from a list of sources
// Base plus pb fortune
export const MAX_CROP_FORTUNE: Record<Crop, number> = {
	[Crop.Cactus]: 1693 + 50,
	[Crop.Carrot]: 1921 + 55,
	[Crop.CocoaBeans]: 1718 + 50,
	[Crop.Melon]: 1706 + 60,
	[Crop.Mushroom]: 1727 + 51,
	[Crop.NetherWart]: 1909 + 46,
	[Crop.Potato]: 1909 + 55,
	[Crop.Pumpkin]: 1718 + 60,
	[Crop.SugarCane]: 1909 + 55,
	[Crop.Wheat]: 1909 + 100,
	[Crop.Seeds]: 1909 + 100, // Not a crop, same as wheat
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