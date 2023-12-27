import { Crop } from './crops';
import { Rarity, ReforgeTarget, Stat } from './reforges';

export enum FarmingToolType {
	Other = 'Other',
	Dicer = 'Dicer',
	MathematicalHoe = 'Mathematical Hoe',
}

export interface FarmingToolInfo {
	crop: Crop;
	name: string;
	maxRarity: Rarity;
	reforgeType: ReforgeTarget;
	type: FarmingToolType;
	upgrade?: string;
	wiki: string;
	stats?: Partial<Record<Rarity, Partial<Record<Stat, number>>>>;
	baseStats?: Partial<Record<Stat, number>>;
}

const HoeStats = {
	[Rarity.Uncommon]: {
		[Stat.FarmingFortune]: 25,
		[Stat.FarmingWisdom]: 2,
	},
	[Rarity.Rare]: {
		[Stat.FarmingFortune]: 50,
		[Stat.FarmingWisdom]: 3,
	},
	[Rarity.Epic]: {
		[Stat.FarmingFortune]: 50,
		[Stat.FarmingWisdom]: 5,
	},
	[Rarity.Legendary]: {
		[Stat.FarmingFortune]: 50,
		[Stat.FarmingWisdom]: 8,
	},
	[Rarity.Mythic]: {
		[Stat.FarmingFortune]: 50,
		[Stat.FarmingWisdom]: 12,
	},
} as const;

export const FARMING_TOOLS: Partial<Record<string, FarmingToolInfo>> = {
	CACTUS_KNIFE: {
		crop: Crop.Cactus,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.Other,
		name: 'Cactus Knife',
		wiki: 'https://wiki.hypixel.net/Cactus_Knife',
	},
	COCO_CHOPPER: {
		crop: Crop.CocoaBeans,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Other,
		name: 'Cocoa Chopper',
		wiki: 'https://wiki.hypixel.net/Cocoa_Chopper',
		baseStats: {
			[Stat.FarmingFortune]: 20,
		},
	},
	FUNGI_CUTTER: {
		crop: Crop.Mushroom,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.Other,
		name: 'Fungi Cutter',
		wiki: 'https://wiki.hypixel.net/Fungi_Cutter',
		baseStats: {
			[Stat.FarmingFortune]: 30,
		},
	},

	MELON_DICER: {
		crop: Crop.Melon,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Dicer,
		upgrade: 'MELON_DICER_2',
		name: 'Melon Dicer',
		wiki: 'https://wiki.hypixel.net/Melon_Dicer',
	},
	MELON_DICER_2: {
		crop: Crop.Melon,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Dicer,
		upgrade: 'MELON_DICER_3',
		name: 'Melon Dicer 2.0',
		wiki: 'https://wiki.hypixel.net/Melon_Dicer',
	},
	MELON_DICER_3: {
		crop: Crop.Melon,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Dicer,
		name: 'Melon Dicer 3.0',
		wiki: 'https://wiki.hypixel.net/Melon_Dicer',
	},

	PUMPKIN_DICER: {
		crop: Crop.Pumpkin,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Dicer,
		upgrade: 'PUMPKIN_DICER_2',
		name: 'Pumpkin Dicer',
		wiki: 'https://wiki.hypixel.net/Pumpkin_Dicer',
	},
	PUMPKIN_DICER_2: {
		crop: Crop.Pumpkin,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Dicer,
		upgrade: 'PUMPKIN_DICER_3',
		name: 'Pumpkin Dicer 2.0',
		wiki: 'https://wiki.hypixel.net/Pumpkin_Dicer',
	},
	PUMPKIN_DICER_3: {
		crop: Crop.Pumpkin,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Dicer,
		name: 'Pumpkin Dicer 3.0',
		wiki: 'https://wiki.hypixel.net/Pumpkin_Dicer',
	},

	THEORETICAL_HOE_CARROT_1: {
		crop: Crop.Carrot,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: 'THEORETICAL_HOE_CARROT_2',
		name: 'Gauss Carrot Hoe',
		wiki: 'https://wiki.hypixel.net/Gauss_Carrot_Hoe',
		stats: HoeStats,
	},
	THEORETICAL_HOE_CARROT_2: {
		crop: Crop.Carrot,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: 'THEORETICAL_HOE_CARROT_3',
		name: 'Gauss Carrot Hoe',
		wiki: 'https://wiki.hypixel.net/Gauss_Carrot_Hoe',
		stats: HoeStats,
	},
	THEORETICAL_HOE_CARROT_3: {
		crop: Crop.Carrot,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		name: 'Gauss Carrot Hoe',
		wiki: 'https://wiki.hypixel.net/Gauss_Carrot_Hoe',
		stats: HoeStats,
	},

	THEORETICAL_HOE_WARTS_1: {
		crop: Crop.NetherWart,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: 'THEORETICAL_HOE_WARTS_2',
		name: 'Newton Nether Warts Hoe',
		wiki: 'https://wiki.hypixel.net/Newton_Nether_Warts_Hoe',
		stats: HoeStats,
	},
	THEORETICAL_HOE_WARTS_2: {
		crop: Crop.NetherWart,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: 'THEORETICAL_HOE_WARTS_3',
		name: 'Newton Nether Warts Hoe',
		wiki: 'https://wiki.hypixel.net/Newton_Nether_Warts_Hoe',
		stats: HoeStats,
	},
	THEORETICAL_HOE_WARTS_3: {
		crop: Crop.NetherWart,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		name: 'Newton Nether Warts Hoe',
		wiki: 'https://wiki.hypixel.net/Newton_Nether_Warts_Hoe',
		stats: HoeStats,
	},

	THEORETICAL_HOE_POTATO_1: {
		crop: Crop.Potato,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: 'THEORETICAL_HOE_POTATO_2',
		name: 'Pythagorean Potato Hoe',
		wiki: 'https://wiki.hypixel.net/Pythagorean_Potato_Hoe',
		stats: HoeStats,
	},
	THEORETICAL_HOE_POTATO_2: {
		crop: Crop.Potato,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: 'THEORETICAL_HOE_POTATO_3',
		name: 'Pythagorean Potato Hoe',
		wiki: 'https://wiki.hypixel.net/Pythagorean_Potato_Hoe',
		stats: HoeStats,
	},
	THEORETICAL_HOE_POTATO_3: {
		crop: Crop.Potato,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		name: 'Pythagorean Potato Hoe',
		wiki: 'https://wiki.hypixel.net/Pythagorean_Potato_Hoe',
		stats: HoeStats,
	},

	THEORETICAL_HOE_CANE_1: {
		crop: Crop.SugarCane,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: 'THEORETICAL_HOE_CANE_2',
		name: 'Turing Sugar Cane Hoe',
		wiki: 'https://wiki.hypixel.net/Turing_Sugar_Cane_Hoe',
		stats: HoeStats,
	},
	THEORETICAL_HOE_CANE_2: {
		crop: Crop.SugarCane,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: 'THEORETICAL_HOE_CANE_3',
		name: 'Turing Sugar Cane Hoe',
		wiki: 'https://wiki.hypixel.net/Turing_Sugar_Cane_Hoe',
		stats: HoeStats,
	},
	THEORETICAL_HOE_CANE_3: {
		crop: Crop.SugarCane,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		name: 'Turing Sugar Cane Hoe',
		wiki: 'https://wiki.hypixel.net/Turing_Sugar_Cane_Hoe',
		stats: HoeStats,
	},

	THEORETICAL_HOE_WHEAT_1: {
		crop: Crop.Wheat,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: 'THEORETICAL_HOE_WHEAT_2',
		name: "Euclid's Wheat Hoe",
		wiki: 'https://wiki.hypixel.net/Euclid%27s_Wheat_Hoe',
		stats: HoeStats,
	},
	THEORETICAL_HOE_WHEAT_2: {
		crop: Crop.Wheat,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: 'THEORETICAL_HOE_WHEAT_3',
		name: "Euclid's Wheat Hoe",
		wiki: 'https://wiki.hypixel.net/Euclid%27s_Wheat_Hoe',
		stats: HoeStats,
	},
	THEORETICAL_HOE_WHEAT_3: {
		crop: Crop.Wheat,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		name: "Euclid's Wheat Hoe",
		wiki: 'https://wiki.hypixel.net/Euclid%27s_Wheat_Hoe',
		stats: HoeStats,
	},
};

export const BEST_FARMING_TOOLS: Partial<Record<Crop, FarmingToolInfo>> = {
	[Crop.Cactus]: FARMING_TOOLS.CACTUS_KNIFE,
	[Crop.CocoaBeans]: FARMING_TOOLS.COCO_CHOPPER,
	[Crop.Mushroom]: FARMING_TOOLS.FUNGI_CUTTER,
	[Crop.Melon]: FARMING_TOOLS.MELON_DICER_3,
	[Crop.Pumpkin]: FARMING_TOOLS.PUMPKIN_DICER_3,
	[Crop.Carrot]: FARMING_TOOLS.THEORETICAL_HOE_CARROT_3,
	[Crop.NetherWart]: FARMING_TOOLS.THEORETICAL_HOE_WARTS_3,
	[Crop.Potato]: FARMING_TOOLS.THEORETICAL_HOE_POTATO_3,
	[Crop.SugarCane]: FARMING_TOOLS.THEORETICAL_HOE_CANE_3,
	[Crop.Wheat]: FARMING_TOOLS.THEORETICAL_HOE_WHEAT_3,
};