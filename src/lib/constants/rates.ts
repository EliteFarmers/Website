import { ReforgeTarget, Stat } from "./reforges";

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
};

export interface FarmingToolInfo {
	crop: Crop;
	name: string;
	maxRarity: Rarity;
	type: ReforgeTarget;
	wiki: string;
	stats?: Partial<Record<Rarity, Partial<Record<Stat, number>>>>;
}

const HoeStats = {
	[Rarity.Epic]: {
		[Stat.FarmingFortune]: 50,
		[Stat.FarmingWisdom]: 5
	},
	[Rarity.Legendary]: {
		[Stat.FarmingFortune]: 50,
		[Stat.FarmingWisdom]: 8
	},
	[Rarity.Mythic]: {
		[Stat.FarmingFortune]: 50,
		[Stat.FarmingWisdom]: 12
	}
}

export const FARMING_TOOLS: Partial<Record<string, FarmingToolInfo>> = {
	CACTUS_KNIFE: { 
		crop: Crop.Cactus,
		maxRarity: Rarity.Epic,
		type: ReforgeTarget.Hoe,
		name: 'Cactus Knife',
		wiki: 'https://wiki.hypixel.net/Cactus_Knife',
	},
	THEORETICAL_HOE_CARROT_1: { 
		crop: Crop.Carrot,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Gauss Carrot Hoe',
		wiki: 'https://wiki.hypixel.net/Gauss_Carrot_Hoe',
		stats: HoeStats,
	},
	THEORETICAL_HOE_CARROT_2: { 
		crop: Crop.Carrot,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Gauss Carrot Hoe',
		wiki: 'https://wiki.hypixel.net/Gauss_Carrot_Hoe',
		stats: HoeStats,
	},
	THEORETICAL_HOE_CARROT_3: { 
		crop: Crop.Carrot,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Gauss Carrot Hoe',
		wiki: 'https://wiki.hypixel.net/Gauss_Carrot_Hoe',
		stats: HoeStats,
	},
	COCO_CHOPPER: { 
		crop: Crop.CocoaBeans,
		maxRarity: Rarity.Legendary,
		type: ReforgeTarget.Axe,
		name: 'Cocoa Chopper',
		wiki: 'https://wiki.hypixel.net/Cocoa_Chopper',
	},
	MELON_DICER: { 
		crop: Crop.Melon,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Axe,
		name: 'Melon Dicer',
		wiki: 'https://wiki.hypixel.net/Melon_Dicer',
	},
	MELON_DICER_2: { 
		crop: Crop.Melon,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Axe,
		name: 'Melon Dicer 2.0',
		wiki: 'https://wiki.hypixel.net/Melon_Dicer',
	},
	MELON_DICER_3: { 
		crop: Crop.Melon,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Axe,
		name: 'Melon Dicer 3.0',
		wiki: 'https://wiki.hypixel.net/Melon_Dicer',
	},
	FUNGI_CUTTER: { 
		crop: Crop.Mushroom,
		maxRarity: Rarity.Legendary,
		type: ReforgeTarget.Hoe,
		name: 'Fungi Cutter',
		wiki: 'https://wiki.hypixel.net/Fungi_Cutter',
	},
	THEORETICAL_HOE_WARTS_1: { 
		crop: Crop.NetherWart,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Newton Nether Warts Hoe',
		wiki: 'https://wiki.hypixel.net/Newton_Nether_Warts_Hoe',
		stats: HoeStats
	},
	THEORETICAL_HOE_WARTS_2: { 
		crop: Crop.NetherWart,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Newton Nether Warts Hoe',
		wiki: 'https://wiki.hypixel.net/Newton_Nether_Warts_Hoe',
		stats: HoeStats
	},
	THEORETICAL_HOE_WARTS_3: { 
		crop: Crop.NetherWart,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Newton Nether Warts Hoe',
		wiki: 'https://wiki.hypixel.net/Newton_Nether_Warts_Hoe',
		stats: HoeStats
	},
	THEORETICAL_HOE_POTATO_1: { 
		crop: Crop.Potato,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Pythagorean Potato Hoe',
		wiki: 'https://wiki.hypixel.net/Pythagorean_Potato_Hoe',
		stats: HoeStats
	},
	THEORETICAL_HOE_POTATO_2: { 
		crop: Crop.Potato,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Pythagorean Potato Hoe',
		wiki: 'https://wiki.hypixel.net/Pythagorean_Potato_Hoe',
		stats: HoeStats
	},
	THEORETICAL_HOE_POTATO_3: { 
		crop: Crop.Potato,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Pythagorean Potato Hoe',
		wiki: 'https://wiki.hypixel.net/Pythagorean_Potato_Hoe',
		stats: HoeStats
	},
	PUMPKIN_DICER: { 
		crop: Crop.Pumpkin,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Axe,
		name: 'Pumpkin Dicer',
		wiki: 'https://wiki.hypixel.net/Pumpkin_Dicer',
	},
	PUMPKIN_DICER_2: { 
		crop: Crop.Pumpkin,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Axe,
		name: 'Pumpkin Dicer 2.0',
		wiki: 'https://wiki.hypixel.net/Pumpkin_Dicer',
	},
	PUMPKIN_DICER_3: { 
		crop: Crop.Pumpkin,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Axe,
		name: 'Pumpkin Dicer 3.0',
		wiki: 'https://wiki.hypixel.net/Pumpkin_Dicer',
	},
	THEORETICAL_HOE_CANE_1: { 
		crop: Crop.SugarCane,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Turing Sugar Cane Hoe',
		wiki: 'https://wiki.hypixel.net/Turing_Sugar_Cane_Hoe',
		stats: HoeStats
	},
	THEORETICAL_HOE_CANE_2: { 
		crop: Crop.SugarCane,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Turing Sugar Cane Hoe',
		wiki: 'https://wiki.hypixel.net/Turing_Sugar_Cane_Hoe',
		stats: HoeStats
	},
	THEORETICAL_HOE_CANE_3: { 
		crop: Crop.SugarCane,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Turing Sugar Cane Hoe',
		wiki: 'https://wiki.hypixel.net/Turing_Sugar_Cane_Hoe',
		stats: HoeStats
	},
	THEORETICAL_HOE_WHEAT_1: { 
		crop: Crop.Wheat,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Euclid\'s Wheat Hoe',
		wiki: 'https://wiki.hypixel.net/Euclid%27s_Wheat_Hoe',
		stats: HoeStats
	},
	THEORETICAL_HOE_WHEAT_2: { 
		crop: Crop.Wheat,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Euclid\'s Wheat Hoe',
		wiki: 'https://wiki.hypixel.net/Euclid%27s_Wheat_Hoe',
		stats: HoeStats
	},
	THEORETICAL_HOE_WHEAT_3: { 
		crop: Crop.Wheat,
		maxRarity: Rarity.Mythic,
		type: ReforgeTarget.Hoe,
		name: 'Euclid\'s Wheat Hoe',
		wiki: 'https://wiki.hypixel.net/Euclid%27s_Wheat_Hoe',
		stats: HoeStats
	},
};
