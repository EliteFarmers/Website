import { Crop } from '../constants/crops.js';
import { Rarity, ReforgeTarget } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import { UpgradeReason } from '../constants/upgrades.js';
import { UpgradeableInfo } from '../fortune/upgradeable.js';

export enum FarmingToolType {
	Other = 'Other',
	Dicer = 'Dicer',
	MathematicalHoe = 'Mathematical Hoe',
	None = 'None',
}

export interface FarmingToolInfo extends UpgradeableInfo {
	crop?: Crop;
	name: string;
	type: FarmingToolType | ReforgeTarget;
	reforgeType: ReforgeTarget;
}

const t1hoeStats = {
	[Rarity.Common]: {
		[Stat.FarmingFortune]: {
			value: 10,
		},
		[Stat.FarmingWisdom]: {
			value: 1,
		},
	},
	[Rarity.Uncommon]: {
		[Stat.FarmingFortune]: {
			value: 10,
		},
		[Stat.FarmingWisdom]: {
			value: 2,
		},
	},
	[Rarity.Rare]: {
		[Stat.FarmingFortune]: {
			value: 10,
		},
		[Stat.FarmingWisdom]: {
			value: 3,
		},
	},
	[Rarity.Epic]: {
		[Stat.FarmingFortune]: {
			value: 10,
		},
		[Stat.FarmingWisdom]: {
			value: 5,
		},
	},
	[Rarity.Legendary]: {
		[Stat.FarmingFortune]: {
			value: 10,
		},
		[Stat.FarmingWisdom]: {
			value: 8,
		},
	},
	[Rarity.Mythic]: {
		[Stat.FarmingFortune]: {
			value: 10,
		},
		[Stat.FarmingWisdom]: {
			value: 12,
		},
	},
} as UpgradeableInfo['stats'];

const t2hoeStats = {
	[Rarity.Common]: {
		[Stat.FarmingFortune]: {
			value: 25,
		},
		[Stat.FarmingWisdom]: {
			value: 1,
		},
	},
	[Rarity.Uncommon]: {
		[Stat.FarmingFortune]: {
			value: 25,
		},
		[Stat.FarmingWisdom]: {
			value: 2,
		},
	},
	[Rarity.Rare]: {
		[Stat.FarmingFortune]: {
			value: 25,
		},
		[Stat.FarmingWisdom]: {
			value: 3,
		},
	},
	[Rarity.Epic]: {
		[Stat.FarmingFortune]: {
			value: 25,
		},
		[Stat.FarmingWisdom]: {
			value: 5,
		},
	},
	[Rarity.Legendary]: {
		[Stat.FarmingFortune]: {
			value: 25,
		},
		[Stat.FarmingWisdom]: {
			value: 8,
		},
	},
	[Rarity.Mythic]: {
		[Stat.FarmingFortune]: {
			value: 25,
		},
		[Stat.FarmingWisdom]: {
			value: 12,
		},
	},
} as UpgradeableInfo['stats'];

const t3hoeStats = {
	[Rarity.Common]: {
		[Stat.FarmingFortune]: {
			value: 50,
		},
		[Stat.FarmingWisdom]: {
			value: 1,
		},
	},
	[Rarity.Uncommon]: {
		[Stat.FarmingFortune]: {
			value: 50,
		},
		[Stat.FarmingWisdom]: {
			value: 2,
		},
	},
	[Rarity.Rare]: {
		[Stat.FarmingFortune]: {
			value: 50,
		},
		[Stat.FarmingWisdom]: {
			value: 3,
		},
	},
	[Rarity.Epic]: {
		[Stat.FarmingFortune]: {
			value: 50,
		},
		[Stat.FarmingWisdom]: {
			value: 5,
		},
	},
	[Rarity.Legendary]: {
		[Stat.FarmingFortune]: {
			value: 50,
		},
		[Stat.FarmingWisdom]: {
			value: 8,
		},
	},
	[Rarity.Mythic]: {
		[Stat.FarmingFortune]: {
			value: 50,
		},
		[Stat.FarmingWisdom]: {
			value: 12,
		},
	},
} as UpgradeableInfo['stats'];

export const FARMING_TOOLS: Partial<Record<string, FarmingToolInfo>> = {
	CACTUS_KNIFE: {
		skyblockId: 'CACTUS_KNIFE',
		crop: Crop.Cactus,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.Other,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
		],
		name: 'Cactus Knife',
		wiki: 'https://wiki.hypixel.net/Cactus_Knife',
	},
	COCO_CHOPPER: {
		skyblockId: 'COCO_CHOPPER',
		crop: Crop.CocoaBeans,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Other,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
		],
		name: 'Cocoa Chopper',
		wiki: 'https://wiki.hypixel.net/Cocoa_Chopper',
		baseStats: {
			[Stat.FarmingFortune]: 20,
		},
	},
	FUNGI_CUTTER: {
		skyblockId: 'FUNGI_CUTTER',
		crop: Crop.Mushroom,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.Other,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
		],
		name: 'Fungi Cutter',
		wiki: 'https://wiki.hypixel.net/Fungi_Cutter',
		baseStats: {
			[Stat.FarmingFortune]: 30,
		},
	},

	MELON_DICER: {
		skyblockId: 'MELON_DICER',
		crop: Crop.Melon,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Dicer,
		upgrade: {
			id: 'MELON_DICER_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					ENCHANTED_MELON_BLOCK: 64,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
		],
		name: 'Melon Dicer',
		wiki: 'https://wiki.hypixel.net/Melon_Dicer',
	},
	MELON_DICER_2: {
		skyblockId: 'MELON_DICER_2',
		crop: Crop.Melon,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Dicer,
		upgrade: {
			id: 'MELON_DICER_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					ENCHANTED_MELON_BLOCK: 128,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
		],
		name: 'Melon Dicer 2.0',
		wiki: 'https://wiki.hypixel.net/Melon_Dicer_2.0',
	},
	MELON_DICER_3: {
		skyblockId: 'MELON_DICER_3',
		crop: Crop.Melon,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Dicer,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FLAWLESS_PERIDOT_GEM',
						amount: 1,
					},
					{
						type: 'COINS',
						coins: 250000,
					},
				],
			},
		],
		name: 'Melon Dicer 3.0',
		wiki: 'https://wiki.hypixel.net/Melon_Dicer_3.0',
	},

	PUMPKIN_DICER: {
		skyblockId: 'PUMPKIN_DICER',
		crop: Crop.Pumpkin,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Dicer,
		upgrade: {
			id: 'PUMPKIN_DICER_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					POLISHED_PUMPKIN: 16,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
		],
		name: 'Pumpkin Dicer',
		wiki: 'https://wiki.hypixel.net/Pumpkin_Dicer',
	},
	PUMPKIN_DICER_2: {
		skyblockId: 'PUMPKIN_DICER_2',
		crop: Crop.Pumpkin,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Dicer,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
		],
		upgrade: {
			id: 'PUMPKIN_DICER_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					POLISHED_PUMPKIN: 32,
				},
			},
		},
		name: 'Pumpkin Dicer 2.0',
		wiki: 'https://wiki.hypixel.net/Pumpkin_Dicer_2.0',
	},
	PUMPKIN_DICER_3: {
		skyblockId: 'PUMPKIN_DICER_3',
		crop: Crop.Pumpkin,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Axe,
		type: FarmingToolType.Dicer,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FLAWLESS_PERIDOT_GEM',
						amount: 1,
					},
					{
						type: 'COINS',
						coins: 250000,
					},
				],
			},
		],
		name: 'Pumpkin Dicer 3.0',
		wiki: 'https://wiki.hypixel.net/Pumpkin_Dicer_3.0',
	},

	THEORETICAL_HOE_CARROT_1: {
		skyblockId: 'THEORETICAL_HOE_CARROT_1',
		crop: Crop.Carrot,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_CARROT_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 64,
					ENCHANTED_CARROT: 256,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
		],
		name: 'Gauss Carrot Hoe',
		wiki: 'https://wiki.hypixel.net/Gauss_Carrot_Hoe#Common_',
		stats: t1hoeStats,
	},
	THEORETICAL_HOE_CARROT_2: {
		skyblockId: 'THEORETICAL_HOE_CARROT_2',
		crop: Crop.Carrot,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_CARROT_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 256,
					ENCHANTED_GOLDEN_CARROT: 256,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
		],
		name: 'Gauss Carrot Hoe',
		wiki: 'https://wiki.hypixel.net/Gauss_Carrot_Hoe#Uncommon_',
		stats: t2hoeStats,
	},
	THEORETICAL_HOE_CARROT_3: {
		skyblockId: 'THEORETICAL_HOE_CARROT_3',
		crop: Crop.Carrot,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FLAWLESS_PERIDOT_GEM',
						amount: 1,
					},
					{
						type: 'COINS',
						coins: 250000,
					},
				],
			},
		],
		name: 'Gauss Carrot Hoe',
		wiki: 'https://wiki.hypixel.net/Gauss_Carrot_Hoe#Rare_',
		stats: t3hoeStats,
	},

	THEORETICAL_HOE_WARTS_1: {
		skyblockId: 'THEORETICAL_HOE_WARTS_1',
		crop: Crop.NetherWart,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_WARTS_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 64,
					ENCHANTED_NETHER_STALK: 256,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
		],
		name: 'Newton Nether Warts Hoe',
		wiki: 'https://wiki.hypixel.net/Newton_Nether_Warts_Hoe#Common_',
		stats: t1hoeStats,
	},
	THEORETICAL_HOE_WARTS_2: {
		skyblockId: 'THEORETICAL_HOE_WARTS_2',
		crop: Crop.NetherWart,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_WARTS_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 256,
					MUTANT_NETHER_STALK: 256,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
		],
		name: 'Newton Nether Warts Hoe',
		wiki: 'https://wiki.hypixel.net/Newton_Nether_Warts_Hoe#Uncommon_',
		stats: t2hoeStats,
	},
	THEORETICAL_HOE_WARTS_3: {
		skyblockId: 'THEORETICAL_HOE_WARTS_3',
		crop: Crop.NetherWart,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FLAWLESS_PERIDOT_GEM',
						amount: 1,
					},
					{
						type: 'COINS',
						coins: 250000,
					},
				],
			},
		],
		name: 'Newton Nether Warts Hoe',
		wiki: 'https://wiki.hypixel.net/Newton_Nether_Warts_Hoe#Rare_',
		stats: t3hoeStats,
	},

	THEORETICAL_HOE_POTATO_1: {
		skyblockId: 'THEORETICAL_HOE_POTATO_1',
		crop: Crop.Potato,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_POTATO_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 64,
					ENCHANTED_POTATO: 256,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
		],
		name: 'Pythagorean Potato Hoe',
		wiki: 'https://wiki.hypixel.net/Pythagorean_Potato_Hoe#Common_',
		stats: t1hoeStats,
	},
	THEORETICAL_HOE_POTATO_2: {
		skyblockId: 'THEORETICAL_HOE_POTATO_2',
		crop: Crop.Potato,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_POTATO_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 256,
					ENCHANTED_BAKED_POTATO: 256,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
		],
		name: 'Pythagorean Potato Hoe',
		wiki: 'https://wiki.hypixel.net/Pythagorean_Potato_Hoe#Uncommon_',
		stats: t2hoeStats,
	},
	THEORETICAL_HOE_POTATO_3: {
		skyblockId: 'THEORETICAL_HOE_POTATO_3',
		crop: Crop.Potato,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FLAWLESS_PERIDOT_GEM',
						amount: 1,
					},
					{
						type: 'COINS',
						coins: 250000,
					},
				],
			},
		],
		name: 'Pythagorean Potato Hoe',
		wiki: 'https://wiki.hypixel.net/Pythagorean_Potato_Hoe#Rare_',
		stats: t3hoeStats,
	},

	THEORETICAL_HOE_CANE_1: {
		skyblockId: 'THEORETICAL_HOE_CANE_1',
		crop: Crop.SugarCane,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_CANE_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 64,
					ENCHANTED_SUGAR: 256,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
		],
		name: 'Turing Sugar Cane Hoe',
		wiki: 'https://wiki.hypixel.net/Turing_Sugar_Cane_Hoe#Common_',
		stats: t1hoeStats,
	},
	THEORETICAL_HOE_CANE_2: {
		skyblockId: 'THEORETICAL_HOE_CANE_2',
		crop: Crop.SugarCane,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_CANE_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 256,
					ENCHANTED_SUGAR_CANE: 256,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
		],
		name: 'Turing Sugar Cane Hoe',
		wiki: 'https://wiki.hypixel.net/Turing_Sugar_Cane_Hoe#Uncommon_',
		stats: t2hoeStats,
	},
	THEORETICAL_HOE_CANE_3: {
		skyblockId: 'THEORETICAL_HOE_CANE_3',
		crop: Crop.SugarCane,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FLAWLESS_PERIDOT_GEM',
						amount: 1,
					},
					{
						type: 'COINS',
						coins: 250000,
					},
				],
			},
		],
		name: 'Turing Sugar Cane Hoe',
		wiki: 'https://wiki.hypixel.net/Turing_Sugar_Cane_Hoe#Rare_',
		stats: t3hoeStats,
	},

	THEORETICAL_HOE_WHEAT_1: {
		skyblockId: 'THEORETICAL_HOE_WHEAT_1',
		crop: Crop.Wheat,
		maxRarity: Rarity.Epic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_WHEAT_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 64,
					ENCHANTED_WHEAT: 256,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
		],
		name: "Euclid's Wheat Hoe",
		wiki: 'https://wiki.hypixel.net/Euclid%27s_Wheat_Hoe#Common_',
		stats: t1hoeStats,
	},
	THEORETICAL_HOE_WHEAT_2: {
		skyblockId: 'THEORETICAL_HOE_WHEAT_2',
		crop: Crop.Wheat,
		maxRarity: Rarity.Legendary,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_WHEAT_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 256,
					ENCHANTED_HAY_BALE: 256,
				},
			},
		},
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
		],
		name: "Euclid's Wheat Hoe",
		wiki: 'https://wiki.hypixel.net/Euclid%27s_Wheat_Hoe#Uncommon_',
		stats: t2hoeStats,
	},
	THEORETICAL_HOE_WHEAT_3: {
		skyblockId: 'THEORETICAL_HOE_WHEAT_3',
		crop: Crop.Wheat,
		maxRarity: Rarity.Mythic,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.MathematicalHoe,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 20,
					},
					{
						type: 'COINS',
						coins: 50000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FINE_PERIDOT_GEM',
						amount: 40,
					},
					{
						type: 'COINS',
						coins: 100000,
					},
				],
			},
			{
				slot_type: 'PERIDOT',
				costs: [
					{
						type: 'ITEM',
						item_id: 'FLAWLESS_PERIDOT_GEM',
						amount: 1,
					},
					{
						type: 'COINS',
						coins: 250000,
					},
				],
			},
		],
		name: "Euclid's Wheat Hoe",
		wiki: 'https://wiki.hypixel.net/Euclid%27s_Wheat_Hoe#Rare_',
		stats: t3hoeStats,
	},
	HOE_OF_NO_TILLING: {
		skyblockId: 'HOE_OF_NO_TILLING',
		maxRarity: Rarity.Rare,
		reforgeType: ReforgeTarget.Hoe,
		type: FarmingToolType.Other,
		name: 'Hoe of No Tilling',
		wiki: 'https://wiki.hypixel.net/Hoe_of_No_Tilling',
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
