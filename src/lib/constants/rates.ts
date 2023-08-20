export enum Crop {
	Cactus = 'Cactus',
	Carrot = 'Carrot',
	CocoaBeans = 'Cocoa Beans',
	Melon = 'Melon',
	Mushroom = 'Mushroom',
	NetherWart = 'Nether Wart',
	Potato = 'Potato',
	Pumpkin = 'Pumpkin',
	SugarCane = 'Sugar Cane',
	Wheat = 'Wheat',
	Seeds = 'Seeds',
}

export enum Rarity {
	Common = 'Common',
	Uncommon = 'Uncommon',
	Rare = 'Rare',
	Epic = 'Epic',
	Legendary = 'Legendary',
	Mythic = 'Mythic',
	Special = 'Special',
	Divine = 'Divine',
}

export const NPC_SELL_PRICES = {
	[Crop.Cactus]: 3,
	[Crop.Carrot]: 3,
	[Crop.CocoaBeans]: 3,
	[Crop.Melon]: 2,
	[Crop.Mushroom]: 10,
	[Crop.NetherWart]: 4,
	[Crop.Potato]: 3,
	[Crop.Pumpkin]: 10,
	[Crop.SugarCane]: 4,
	[Crop.Wheat]: 6,
	[Crop.Seeds]: 3,
};

export const BASE_DROP_RATES = {
	[Crop.Cactus]: 2, // Doubled due to breaking 2 cactus at once
	[Crop.Carrot]: 3,
	[Crop.CocoaBeans]: 3,
	[Crop.Melon]: 5,
	[Crop.Mushroom]: 1,
	[Crop.NetherWart]: 2.5,
	[Crop.Potato]: 3,
	[Crop.Pumpkin]: 1,
	[Crop.SugarCane]: 2, // Doubled due to breaking 2 sugar cane at once
	[Crop.Wheat]: 1,
	[Crop.Seeds]: 1.5,
}

export const FARMING_TOOLS = {
	"CACTUS_KNIFE": Crop.Cactus,
	"THEORETICAL_HOE_CARROT_1": Crop.Carrot,
	"THEORETICAL_HOE_CARROT_2": Crop.Carrot,
	"THEORETICAL_HOE_CARROT_3": Crop.Carrot,
	"COCO_CHOPPER": Crop.CocoaBeans,
	"MELON_DICER": Crop.Melon,
	"MELON_DICER_2": Crop.Melon,
	"MELON_DICER_3": Crop.Melon,
	"FUNGI_CUTTER": Crop.Mushroom,
	"THEORETICAL_HOE_WARTS_1": Crop.NetherWart,
	"THEORETICAL_HOE_WARTS_2": Crop.NetherWart,
	"THEORETICAL_HOE_WARTS_3": Crop.NetherWart,
	"THEORETICAL_HOE_POTATO_1": Crop.Potato,
	"THEORETICAL_HOE_POTATO_2": Crop.Potato,
	"THEORETICAL_HOE_POTATO_3": Crop.Potato,
	"PUMPKIN_DICER": Crop.Pumpkin,
	"PUMPKIN_DICER_2": Crop.Pumpkin,
	"PUMPKIN_DICER_3": Crop.Pumpkin,
	"THEORETICAL_HOE_CANE_1": Crop.SugarCane,
	"THEORETICAL_HOE_CANE_2": Crop.SugarCane,
	"THEORETICAL_HOE_CANE_3": Crop.SugarCane,
	"THEORETICAL_HOE_WHEAT_1": Crop.Wheat,
	"THEORETICAL_HOE_WHEAT_2": Crop.Wheat,
	"THEORETICAL_HOE_WHEAT_3": Crop.Wheat,
}