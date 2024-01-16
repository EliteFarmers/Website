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
};
