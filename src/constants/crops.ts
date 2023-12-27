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
	},
	[Crop.CocoaBeans]: {
		name: 'Cocoa Beans',
		npc: 3,
		drops: 3,
		replenish: true,
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
	},
	[Crop.Seeds]: {
		name: 'Seeds',
		npc: 3,
		drops: 1.5,
		replenish: true,
	},
};

// TODO: Calculate this from a list of sources
export const MAX_CROP_FORTUNE: Record<Crop, number> = {
	[Crop.Cactus]: 1581,
	[Crop.Carrot]: 1845,
	[Crop.CocoaBeans]: 1657,
	[Crop.Melon]: 1640,
	[Crop.Mushroom]: 1663,
	[Crop.NetherWart]: 1833,
	[Crop.Potato]: 1833,
	[Crop.Pumpkin]: 1664,
	[Crop.SugarCane]: 1833,
	[Crop.Wheat]: 1833,
	[Crop.Seeds]: 1833, // Not a crop, same as wheat
};
