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
	startingTool: string;
}

export const CROP_INFO: Record<Crop, CropInfo> = {
	[Crop.Cactus]: {
		name: 'Cactus',
		npc: 4,
		drops: 2,
		breaks: 2,
		startingTool: 'CACTUS_KNIFE',
	},
	[Crop.Carrot]: {
		name: 'Carrot',
		npc: 3,
		drops: 3,
		replenish: true,
		exportable: true,
		startingTool: 'THEORETICAL_HOE_CARROT_1',
	},
	[Crop.CocoaBeans]: {
		name: 'Cocoa Beans',
		npc: 3,
		drops: 3,
		replenish: true,
		exportable: true,
		startingTool: 'COCO_CHOPPER',
	},
	[Crop.Melon]: {
		name: 'Melon',
		npc: 2,
		drops: 5,
		startingTool: 'MELON_DICER',
	},
	[Crop.Mushroom]: {
		name: 'Mushroom',
		npc: 10,
		drops: 1,
		startingTool: 'FUNGI_CUTTER',
	},
	[Crop.NetherWart]: {
		name: 'Nether Wart',
		npc: 4,
		drops: 2.5,
		replenish: true,
		startingTool: 'THEORETICAL_HOE_WARTS_1',
	},
	[Crop.Potato]: {
		name: 'Potato',
		npc: 3,
		drops: 3,
		replenish: true,
		startingTool: 'THEORETICAL_HOE_POTATO_1',
	},
	[Crop.Pumpkin]: {
		name: 'Pumpkin',
		npc: 10,
		drops: 1,
		exportable: true,
		startingTool: 'PUMPKIN_DICER',
	},
	[Crop.SugarCane]: {
		name: 'Sugar Cane',
		npc: 4,
		drops: 2,
		breaks: 2,
		startingTool: 'THEORETICAL_HOE_CANE_1',
	},
	[Crop.Wheat]: {
		name: 'Wheat',
		npc: 6,
		drops: 1,
		exportable: true,
		startingTool: 'THEORETICAL_HOE_WHEAT_1',
	},
	[Crop.Seeds]: {
		name: 'Seeds',
		npc: 3,
		drops: 1.5,
		replenish: true,
		startingTool: 'THEORETICAL_HOE_WHEAT_1',
	},
};

// TODO: Calculate this from a list of sources
// Base plus pb fortune
export const MAX_CROP_FORTUNE: Record<Crop, number> = {
	[Crop.Cactus]: 1778,
	[Crop.Carrot]: 2013,
	[Crop.CocoaBeans]: 1842,
	[Crop.Melon]: 1809,
	[Crop.Mushroom]: 1813,
	[Crop.NetherWart]: 1991,
	[Crop.Potato]: 2001,
	[Crop.Pumpkin]: 1821,
	[Crop.SugarCane]: 2001,
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