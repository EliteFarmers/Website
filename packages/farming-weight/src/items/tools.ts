import { Crop } from '../constants/crops.js';
import { ITEM_IDS } from '../constants/itemids.js';
import { Rarity, ReforgeTarget } from '../constants/reforges.js';
import { UpgradeReason } from '../constants/upgrades.js';
import { FarmingToolType, type ItemDefinition } from './definitions.js';

export { FarmingToolType, type ItemDefinition as FarmingToolInfo };

type FarmingToolInfo = ItemDefinition;

const t1Gems: ItemDefinition['gemSlots'] = [
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
		requirements: [
			{
				type: 'ITEM_DATA',
				data_key: 'levelable_lvl',
				value: '5',
				operator: 'GREATER_THAN_OR_EQUALS',
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
		requirements: [
			{
				type: 'ITEM_DATA',
				data_key: 'levelable_lvl',
				value: '15',
				operator: 'GREATER_THAN_OR_EQUALS',
			},
		],
	},
];

const t2Gems: ItemDefinition['gemSlots'] = [
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
		requirements: [
			{
				type: 'ITEM_DATA',
				data_key: 'levelable_lvl',
				value: '5',
				operator: 'GREATER_THAN_OR_EQUALS',
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
		requirements: [
			{
				type: 'ITEM_DATA',
				data_key: 'levelable_lvl',
				value: '15',
				operator: 'GREATER_THAN_OR_EQUALS',
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
		requirements: [
			{
				type: 'ITEM_DATA',
				data_key: 'levelable_lvl',
				value: '25',
				operator: 'GREATER_THAN_OR_EQUALS',
			},
		],
	},
];

const t3Gems: ItemDefinition['gemSlots'] = [
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
		requirements: [
			{
				type: 'ITEM_DATA',
				data_key: 'levelable_lvl',
				value: '5',
				operator: 'GREATER_THAN_OR_EQUALS',
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
		requirements: [
			{
				type: 'ITEM_DATA',
				data_key: 'levelable_lvl',
				value: '15',
				operator: 'GREATER_THAN_OR_EQUALS',
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
		requirements: [
			{
				type: 'ITEM_DATA',
				data_key: 'levelable_lvl',
				value: '25',
				operator: 'GREATER_THAN_OR_EQUALS',
			},
		],
	},
	{
		slot_type: 'PERIDOT',
		costs: [
			{
				type: 'ITEM',
				item_id: 'FLAWLESS_PERIDOT_GEM',
				amount: 2,
			},
			{
				type: 'COINS',
				coins: 1000000,
			},
		],
		requirements: [
			{
				type: 'ITEM_DATA',
				data_key: 'levelable_lvl',
				value: '50',
				operator: 'GREATER_THAN_OR_EQUALS',
			},
		],
	},
];

export const FARMING_TOOLS: Partial<Record<string, FarmingToolInfo>> = {
	CACTUS_KNIFE: {
		skyblockId: 'CACTUS_KNIFE',
		crops: [Crop.Cactus],
		maxRarity: Rarity.Rare,
		type: ReforgeTarget.Hoe,
		gemSlots: t1Gems,
		name: 'Cactus Knife Mk. I',
		wiki: 'https://wiki.hypixel.net/Cactus_Knife',
		upgrade: {
			id: 'CACTUS_KNIFE_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					ENCHANTED_CACTUS: 32,
					JACOBS_TICKET: 64,
				},
			},
		},
	},
	CACTUS_KNIFE_2: {
		skyblockId: 'CACTUS_KNIFE_2',
		crops: [Crop.Cactus],
		maxRarity: Rarity.Epic,
		type: ReforgeTarget.Hoe,
		gemSlots: t2Gems,
		name: 'Cactus Knife Mk. II',
		wiki: 'https://wiki.hypixel.net/Cactus_Knife',
		upgrade: {
			id: 'CACTUS_KNIFE_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					ENCHANTED_CACTUS: 128,
					JACOBS_TICKET: 256,
				},
			},
		},
	},
	CACTUS_KNIFE_3: {
		skyblockId: 'CACTUS_KNIFE_3',
		crops: [Crop.Cactus],
		maxRarity: Rarity.Legendary,
		type: ReforgeTarget.Hoe,
		gemSlots: t3Gems,
		name: 'Cactus Knife Mk. III',
		wiki: 'https://wiki.hypixel.net/Cactus_Knife',
	},
	COCO_CHOPPER: {
		skyblockId: 'COCO_CHOPPER',
		crops: [Crop.CocoaBeans],
		maxRarity: Rarity.Rare,
		type: ReforgeTarget.Axe,
		gemSlots: t1Gems,
		name: 'Cocoa Chopper Mk. I',
		wiki: 'https://wiki.hypixel.net/Cocoa_Chopper',
		upgrade: {
			id: 'COCO_CHOPPER_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					ENCHANTED_COOKIE: 40,
					JACOBS_TICKET: 64,
				},
			},
		},
	},
	COCO_CHOPPER_2: {
		skyblockId: 'COCO_CHOPPER_2',
		crops: [Crop.CocoaBeans],
		maxRarity: Rarity.Epic,
		type: ReforgeTarget.Axe,
		gemSlots: t2Gems,
		name: 'Cocoa Chopper Mk. II',
		wiki: 'https://wiki.hypixel.net/Cocoa_Chopper',
		upgrade: {
			id: 'COCO_CHOPPER_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					ENCHANTED_COOKIE: 160,
					JACOBS_TICKET: 256,
				},
			},
		},
	},
	COCO_CHOPPER_3: {
		skyblockId: 'COCO_CHOPPER_3',
		crops: [Crop.CocoaBeans],
		maxRarity: Rarity.Legendary,
		type: ReforgeTarget.Axe,
		gemSlots: t3Gems,
		name: 'Cocoa Chopper Mk. III',
		wiki: 'https://wiki.hypixel.net/Cocoa_Chopper',
	},
	FUNGI_CUTTER: {
		skyblockId: 'FUNGI_CUTTER',
		crops: [Crop.Mushroom],
		maxRarity: Rarity.Rare,
		type: ReforgeTarget.Hoe,
		gemSlots: t1Gems,
		name: 'Fungi Cutter Mk. I',
		wiki: 'https://wiki.hypixel.net/Fungi_Cutter',
		upgrade: {
			id: 'FUNGI_CUTTER_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					[ITEM_IDS.EnchantedBrownMushroomBlock]: 10,
					[ITEM_IDS.EnchantedRedMushroomBlock]: 10,
					JACOBS_TICKET: 64,
				},
			},
		},
	},
	FUNGI_CUTTER_2: {
		skyblockId: 'FUNGI_CUTTER_2',
		crops: [Crop.Mushroom],
		maxRarity: Rarity.Epic,
		type: ReforgeTarget.Hoe,
		gemSlots: t2Gems,
		name: 'Fungi Cutter Mk. II',
		wiki: 'https://wiki.hypixel.net/Fungi_Cutter',
		upgrade: {
			id: 'FUNGI_CUTTER_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					[ITEM_IDS.EnchantedBrownMushroomBlock]: 40,
					[ITEM_IDS.EnchantedRedMushroomBlock]: 40,
					JACOBS_TICKET: 256,
				},
			},
		},
	},
	FUNGI_CUTTER_3: {
		skyblockId: 'FUNGI_CUTTER_3',
		crops: [Crop.Mushroom],
		maxRarity: Rarity.Legendary,
		type: ReforgeTarget.Hoe,
		gemSlots: t3Gems,
		name: 'Fungi Cutter Mk. III',
		wiki: 'https://wiki.hypixel.net/Fungi_Cutter',
	},

	MELON_DICER: {
		skyblockId: 'MELON_DICER',
		crops: [Crop.Melon],
		maxRarity: Rarity.Rare,
		type: FarmingToolType.Dicer,
		upgrade: {
			id: 'MELON_DICER_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 64,
					[ITEM_IDS.JacobsTicket]: 64,
				},
			},
		},
		gemSlots: t1Gems,
		name: 'Melon Dicer Mk. I',
		wiki: 'https://wiki.hypixel.net/Melon_Dicer',
	},
	MELON_DICER_2: {
		skyblockId: 'MELON_DICER_2',
		crops: [Crop.Melon],
		maxRarity: Rarity.Epic,
		type: FarmingToolType.Dicer,
		upgrade: {
			id: 'MELON_DICER_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 256,
					[ITEM_IDS.JacobsTicket]: 256,
				},
			},
		},
		gemSlots: t2Gems,
		name: 'Melon Dicer Mk. II',
		wiki: 'https://wiki.hypixel.net/Melon_Dicer_2.0',
	},
	MELON_DICER_3: {
		skyblockId: 'MELON_DICER_3',
		crops: [Crop.Melon],
		maxRarity: Rarity.Legendary,
		type: FarmingToolType.Dicer,
		gemSlots: t3Gems,
		name: 'Melon Dicer Mk. III',
		wiki: 'https://wiki.hypixel.net/Melon_Dicer_3.0',
	},

	PUMPKIN_DICER: {
		skyblockId: 'PUMPKIN_DICER',
		crops: [Crop.Pumpkin],
		maxRarity: Rarity.Rare,
		type: FarmingToolType.Dicer,
		upgrade: {
			id: 'PUMPKIN_DICER_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					[ITEM_IDS.PolishedPumpkin]: 20,
					[ITEM_IDS.JacobsTicket]: 64,
				},
			},
		},
		gemSlots: t1Gems,
		name: 'Pumpkin Dicer Mk. I',
		wiki: 'https://wiki.hypixel.net/Pumpkin_Dicer',
	},
	PUMPKIN_DICER_2: {
		skyblockId: 'PUMPKIN_DICER_2',
		crops: [Crop.Pumpkin],
		maxRarity: Rarity.Epic,
		type: FarmingToolType.Dicer,
		gemSlots: t2Gems,
		upgrade: {
			id: 'PUMPKIN_DICER_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					[ITEM_IDS.PolishedPumpkin]: 80,
					[ITEM_IDS.JacobsTicket]: 256,
				},
			},
		},
		name: 'Pumpkin Dicer Mk. II',
		wiki: 'https://wiki.hypixel.net/Pumpkin_Dicer_2.0',
	},
	PUMPKIN_DICER_3: {
		skyblockId: 'PUMPKIN_DICER_3',
		crops: [Crop.Pumpkin],
		maxRarity: Rarity.Legendary,
		type: FarmingToolType.Dicer,
		gemSlots: t3Gems,
		name: 'Pumpkin Dicer Mk. III',
		wiki: 'https://wiki.hypixel.net/Pumpkin_Dicer_3.0',
	},

	THEORETICAL_HOE_CARROT_1: {
		skyblockId: 'THEORETICAL_HOE_CARROT_1',
		crops: [Crop.Carrot],
		maxRarity: Rarity.Rare,
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
		gemSlots: t1Gems,
		name: 'Gauss Carrot Hoe Mk. I',
		wiki: 'https://wiki.hypixel.net/Gauss_Carrot_Hoe#Common_',
	},
	THEORETICAL_HOE_CARROT_2: {
		skyblockId: 'THEORETICAL_HOE_CARROT_2',
		crops: [Crop.Carrot],
		maxRarity: Rarity.Epic,
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
		gemSlots: t2Gems,
		name: 'Gauss Carrot Hoe Mk. II',
		wiki: 'https://wiki.hypixel.net/Gauss_Carrot_Hoe#Uncommon_',
	},
	THEORETICAL_HOE_CARROT_3: {
		skyblockId: 'THEORETICAL_HOE_CARROT_3',
		crops: [Crop.Carrot],
		maxRarity: Rarity.Legendary,
		type: FarmingToolType.MathematicalHoe,
		gemSlots: t3Gems,
		name: 'Gauss Carrot Hoe Mk. III',
		wiki: 'https://wiki.hypixel.net/Gauss_Carrot_Hoe#Rare_',
	},

	THEORETICAL_HOE_WARTS_1: {
		skyblockId: 'THEORETICAL_HOE_WARTS_1',
		crops: [Crop.NetherWart],
		maxRarity: Rarity.Rare,
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
		gemSlots: t1Gems,
		name: 'Newton Nether Warts Hoe Mk. I',
		wiki: 'https://wiki.hypixel.net/Newton_Nether_Warts_Hoe#Common_',
	},
	THEORETICAL_HOE_WARTS_2: {
		skyblockId: 'THEORETICAL_HOE_WARTS_2',
		crops: [Crop.NetherWart],
		maxRarity: Rarity.Epic,
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
		gemSlots: t2Gems,
		name: 'Newton Nether Warts Hoe Mk. II',
		wiki: 'https://wiki.hypixel.net/Newton_Nether_Warts_Hoe#Uncommon_',
	},
	THEORETICAL_HOE_WARTS_3: {
		skyblockId: 'THEORETICAL_HOE_WARTS_3',
		crops: [Crop.NetherWart],
		maxRarity: Rarity.Legendary,
		type: FarmingToolType.MathematicalHoe,
		gemSlots: t3Gems,
		name: 'Newton Nether Warts Hoe Mk. III',
		wiki: 'https://wiki.hypixel.net/Newton_Nether_Warts_Hoe#Rare_',
	},

	THEORETICAL_HOE_POTATO_1: {
		skyblockId: 'THEORETICAL_HOE_POTATO_1',
		crops: [Crop.Potato],
		maxRarity: Rarity.Rare,
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
		gemSlots: t1Gems,
		name: 'Pythagorean Potato Hoe Mk. I',
		wiki: 'https://wiki.hypixel.net/Pythagorean_Potato_Hoe#Common_',
	},
	THEORETICAL_HOE_POTATO_2: {
		skyblockId: 'THEORETICAL_HOE_POTATO_2',
		crops: [Crop.Potato],
		maxRarity: Rarity.Epic,
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
		gemSlots: t2Gems,
		name: 'Pythagorean Potato Hoe Mk. II',
		wiki: 'https://wiki.hypixel.net/Pythagorean_Potato_Hoe#Uncommon_',
	},
	THEORETICAL_HOE_POTATO_3: {
		skyblockId: 'THEORETICAL_HOE_POTATO_3',
		crops: [Crop.Potato],
		maxRarity: Rarity.Legendary,
		type: FarmingToolType.MathematicalHoe,
		gemSlots: t3Gems,
		name: 'Pythagorean Potato Hoe Mk. III',
		wiki: 'https://wiki.hypixel.net/Pythagorean_Potato_Hoe#Rare_',
	},

	THEORETICAL_HOE_CANE_1: {
		skyblockId: 'THEORETICAL_HOE_CANE_1',
		crops: [Crop.SugarCane],
		maxRarity: Rarity.Rare,
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
		gemSlots: t1Gems,
		name: 'Turing Sugar Cane Hoe Mk. I',
		wiki: 'https://wiki.hypixel.net/Turing_Sugar_Cane_Hoe#Common_',
	},
	THEORETICAL_HOE_CANE_2: {
		skyblockId: 'THEORETICAL_HOE_CANE_2',
		crops: [Crop.SugarCane],
		maxRarity: Rarity.Epic,
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
		gemSlots: t2Gems,
		name: 'Turing Sugar Cane Hoe Mk. II',
		wiki: 'https://wiki.hypixel.net/Turing_Sugar_Cane_Hoe#Uncommon_',
	},
	THEORETICAL_HOE_CANE_3: {
		skyblockId: 'THEORETICAL_HOE_CANE_3',
		crops: [Crop.SugarCane],
		maxRarity: Rarity.Legendary,
		type: FarmingToolType.MathematicalHoe,
		gemSlots: t3Gems,
		name: 'Turing Sugar Cane Hoe Mk. III',
		wiki: 'https://wiki.hypixel.net/Turing_Sugar_Cane_Hoe#Rare_',
	},

	THEORETICAL_HOE_WHEAT_1: {
		skyblockId: 'THEORETICAL_HOE_WHEAT_1',
		crops: [Crop.Wheat],
		maxRarity: Rarity.Rare,
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
		gemSlots: t1Gems,
		name: "Euclid's Wheat Hoe Mk. I",
		wiki: 'https://wiki.hypixel.net/Euclid%27s_Wheat_Hoe#Common_',
	},
	THEORETICAL_HOE_WHEAT_2: {
		skyblockId: 'THEORETICAL_HOE_WHEAT_2',
		crops: [Crop.Wheat],
		maxRarity: Rarity.Epic,
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
		gemSlots: t2Gems,
		name: "Euclid's Wheat Hoe Mk. II",
		wiki: 'https://wiki.hypixel.net/Euclid%27s_Wheat_Hoe#Uncommon_',
	},
	THEORETICAL_HOE_WHEAT_3: {
		skyblockId: 'THEORETICAL_HOE_WHEAT_3',
		crops: [Crop.Wheat],
		maxRarity: Rarity.Legendary,
		type: FarmingToolType.MathematicalHoe,
		gemSlots: t3Gems,
		name: "Euclid's Wheat Hoe Mk. III",
		wiki: 'https://wiki.hypixel.net/Euclid%27s_Wheat_Hoe#Rare_',
	},

	THEORETICAL_HOE_SUNFLOWER_1: {
		skyblockId: 'THEORETICAL_HOE_SUNFLOWER_1',
		crops: [Crop.Sunflower, Crop.Moonflower],
		maxRarity: Rarity.Rare,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_SUNFLOWER_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 64,
					COMPACTED_SUNFLOWER: 20,
					COMPACTED_MOONFLOWER: 20,
				},
			},
		},
		gemSlots: t1Gems,
		name: 'Eclipse Hoe Mk. I',
		wiki: 'https://wiki.hypixel.net/Eclipse_Hoe#Common_',
	},
	THEORETICAL_HOE_SUNFLOWER_2: {
		skyblockId: 'THEORETICAL_HOE_SUNFLOWER_2',
		crops: [Crop.Sunflower, Crop.Moonflower],
		maxRarity: Rarity.Epic,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_SUNFLOWER_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 256,
					COMPACTED_SUNFLOWER: 80,
					COMPACTED_MOONFLOWER: 80,
				},
			},
		},
		gemSlots: t2Gems,
		name: 'Eclipse Hoe Mk. II',
		wiki: 'https://wiki.hypixel.net/Eclipse_Hoe#Uncommon_',
	},
	THEORETICAL_HOE_SUNFLOWER_3: {
		skyblockId: 'THEORETICAL_HOE_SUNFLOWER_3',
		crops: [Crop.Sunflower, Crop.Moonflower],
		maxRarity: Rarity.Legendary,
		type: FarmingToolType.MathematicalHoe,
		gemSlots: t3Gems,
		name: 'Eclipse Hoe Mk. III',
		wiki: 'https://wiki.hypixel.net/Eclipse_Hoe#Rare_',
	},

	THEORETICAL_HOE_WILD_ROSE_1: {
		skyblockId: 'THEORETICAL_HOE_WILD_ROSE_1',
		crops: [Crop.WildRose],
		maxRarity: Rarity.Rare,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_WILD_ROSE_2',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 64,
					COMPACTED_WILD_ROSE: 40,
				},
			},
		},
		gemSlots: t1Gems,
		name: 'Wild Rose Hoe Mk. I',
		wiki: 'https://wiki.hypixel.net/Wild_Rose_Hoe#Common_',
	},
	THEORETICAL_HOE_WILD_ROSE_2: {
		skyblockId: 'THEORETICAL_HOE_WILD_ROSE_2',
		crops: [Crop.WildRose],
		maxRarity: Rarity.Epic,
		type: FarmingToolType.MathematicalHoe,
		upgrade: {
			id: 'THEORETICAL_HOE_WILD_ROSE_3',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					JACOBS_TICKET: 256,
					COMPACTED_WILD_ROSE: 160,
				},
			},
		},
		gemSlots: t2Gems,
		name: 'Wild Rose Hoe Mk. II',
		wiki: 'https://wiki.hypixel.net/Wild_Rose_Hoe#Uncommon_',
	},
	THEORETICAL_HOE_WILD_ROSE_3: {
		skyblockId: 'THEORETICAL_HOE_WILD_ROSE_3',
		crops: [Crop.WildRose],
		maxRarity: Rarity.Legendary,
		type: FarmingToolType.MathematicalHoe,
		gemSlots: t3Gems,
		name: 'Wild Rose Hoe Mk. III',
		wiki: 'https://wiki.hypixel.net/Wild_Rose_Hoe#Rare_',
	},

	HOE_OF_NO_TILLING: {
		skyblockId: 'HOE_OF_NO_TILLING',
		maxRarity: Rarity.Rare,
		type: ReforgeTarget.Hoe,
		name: 'Hoe of No Tilling',
		wiki: 'https://wiki.hypixel.net/Hoe_of_No_Tilling',
	},
};

export const BEST_FARMING_TOOLS: Partial<Record<Crop, FarmingToolInfo>> = {
	[Crop.Cactus]: FARMING_TOOLS.CACTUS_KNIFE_3 ?? FARMING_TOOLS.CACTUS_KNIFE,
	[Crop.CocoaBeans]: FARMING_TOOLS.COCO_CHOPPER_3 ?? FARMING_TOOLS.COCO_CHOPPER,
	[Crop.Mushroom]: FARMING_TOOLS.FUNGI_CUTTER_3 ?? FARMING_TOOLS.FUNGI_CUTTER,
	[Crop.Melon]: FARMING_TOOLS.MELON_DICER_3,
	[Crop.Pumpkin]: FARMING_TOOLS.PUMPKIN_DICER_3,
	[Crop.Carrot]: FARMING_TOOLS.THEORETICAL_HOE_CARROT_3,
	[Crop.NetherWart]: FARMING_TOOLS.THEORETICAL_HOE_WARTS_3,
	[Crop.Potato]: FARMING_TOOLS.THEORETICAL_HOE_POTATO_3,
	[Crop.SugarCane]: FARMING_TOOLS.THEORETICAL_HOE_CANE_3,
	[Crop.Wheat]: FARMING_TOOLS.THEORETICAL_HOE_WHEAT_3,
};
