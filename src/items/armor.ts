import { Rarity, ReforgeTarget } from '../constants/reforges.js';
import { Skill } from '../constants/skills.js';
import { SpecialCrop } from '../constants/specialcrops.js';
import { Stat } from '../constants/stats.js';
import { Upgrade, UpgradeReason } from '../constants/upgrades.js';
import { UpgradeableInfo } from '../fortune/upgradeable.js';

export enum GearSlot {
	Boots = 'Boots',
	Leggings = 'Leggings',
	Chestplate = 'Chestplate',
	Helmet = 'Helmet',
	Necklace = 'Necklace',
	Cloak = 'Cloak',
	Belt = 'Belt',
	Gloves = 'Gloves',
}

export interface GearSlotInfo {
	name: string;
	startingItem: string;
	target: ReforgeTarget;
}

export const GEAR_SLOTS: Record<GearSlot, GearSlotInfo> = {
	[GearSlot.Helmet]: {
		name: 'Helmet',
		target: ReforgeTarget.Armor,
		startingItem: 'FARM_ARMOR_HELMET',
	},
	[GearSlot.Chestplate]: {
		name: 'Chestplate',
		target: ReforgeTarget.Armor,
		startingItem: 'FARM_ARMOR_CHESTPLATE',
	},
	[GearSlot.Leggings]: {
		name: 'Leggings',
		target: ReforgeTarget.Armor,
		startingItem: 'FARM_ARMOR_LEGGINGS',
	},
	[GearSlot.Boots]: {
		name: 'Boots',
		target: ReforgeTarget.Armor,
		startingItem: 'FARM_ARMOR_BOOTS',
	},
	[GearSlot.Necklace]: {
		name: 'Necklace',
		target: ReforgeTarget.Equipment,
		startingItem: 'LOTUS_NECKLACE',
	},
	[GearSlot.Cloak]: {
		name: 'Cloak',
		target: ReforgeTarget.Equipment,
		startingItem: 'LOTUS_CLOAK',
	},
	[GearSlot.Belt]: {
		name: 'Belt',
		target: ReforgeTarget.Equipment,
		startingItem: 'LOTUS_BELT',
	},
	[GearSlot.Gloves]: {
		name: 'Gloves',
		target: ReforgeTarget.Equipment,
		startingItem: 'LOTUS_BRACELET',
	},
};

export interface FarmingArmorInfo extends UpgradeableInfo {
	special?: SpecialCrop[];
	slot: GearSlot;
	family?: string;
	maxRarity: Rarity;
	upgrade?: Upgrade;
	wiki: string;
	contestStatsMultiplier?: number;
	perLevelStats?: {
		skill: Skill;
		appliesTo?: ReforgeTarget[];
		stats: Partial<Record<Stat, number>>;
	};
	skillReq?: Partial<Record<Skill, number>>;
}

export const FARMING_ARMOR_INFO: Record<string, FarmingArmorInfo> = {
	FARMER_BOOTS: {
		skyblockId: 'FARMER_BOOTS',
		name: 'Farmer Boots',
		wiki: 'https://wiki.hypixel.net/Farmer_Boots',
		upgrade: {
			id: 'RANCHERS_BOOTS',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					ENCHANTED_PUMPKIN: 256,
				},
			},
		},
		maxRarity: Rarity.Rare,
		slot: GearSlot.Boots,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [
					{ type: 'ITEM', item_id: 'FINE_PERIDOT_GEM', amount: 20 },
					{ type: 'COINS', coins: 50000 },
				],
			},
		],
		skillReq: {
			[Skill.Farming]: 18,
		},
		perLevelStats: {
			skill: Skill.Farming,
			stats: {
				[Stat.FarmingFortune]: 1,
			},
		},
	},
	RANCHERS_BOOTS: {
		skyblockId: 'RANCHERS_BOOTS',
		name: "Rancher's Boots",
		wiki: 'https://wiki.hypixel.net/Rancher%27s_Boots',
		upgrade: {
			id: 'FERMENTO_BOOTS',
			reason: UpgradeReason.Situational,
			why: 'Fermento Boots provide more farming fortune, with the tradeoff of not being able to control your speed.',
			preferred: true,
		},
		maxRarity: Rarity.Legendary,
		slot: GearSlot.Boots,
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
		skillReq: {
			[Skill.Farming]: 21,
		},
		perLevelStats: {
			skill: Skill.Farming,
			stats: {
				[Stat.FarmingFortune]: 1,
			},
		},
	},
	ENCHANTED_JACK_O_LANTERN: {
		skyblockId: 'ENCHANTED_JACK_O_LANTERN',
		name: 'Lantern Helmet',
		wiki: 'https://wiki.hypixel.net/Lantern_Helmet',
		upgrade: {
			id: 'FERMENTO_HELMET',
			reason: UpgradeReason.DeadEnd,
		},
		maxRarity: Rarity.Rare,
		slot: GearSlot.Helmet,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [],
			},
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
		skillReq: {
			[Skill.Farming]: 15,
		},
		perLevelStats: {
			skill: Skill.Farming,
			appliesTo: [ReforgeTarget.Axe],
			stats: {
				[Stat.FarmingFortune]: 1,
			},
		},
	},
	FARM_ARMOR_HELMET: {
		skyblockId: 'FARM_ARMOR_HELMET',
		name: 'Farm Armor Helmet',
		wiki: 'https://wiki.hypixel.net/Farm_Armor',
		upgrade: {
			id: 'MELON_HELMET',
			reason: UpgradeReason.DeadEnd,
		},
		family: 'FARM_ARMOR',
		slot: GearSlot.Helmet,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [],
			},
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
		maxRarity: Rarity.Epic,
		baseStats: {
			[Stat.FarmingFortune]: 10,
		},
		skillReq: {
			[Skill.Farming]: 10,
		},
	},
	FARM_ARMOR_CHESTPLATE: {
		skyblockId: 'FARM_ARMOR_CHESTPLATE',
		name: 'Farm Armor Chestplate',
		wiki: 'https://wiki.hypixel.net/Farm_Armor',
		upgrade: {
			id: 'MELON_CHESTPLATE',
			reason: UpgradeReason.DeadEnd,
		},
		family: 'FARM_ARMOR',
		slot: GearSlot.Chestplate,
		maxRarity: Rarity.Epic,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [],
			},
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
		baseStats: {
			[Stat.FarmingFortune]: 10,
		},
		skillReq: {
			[Skill.Farming]: 10,
		},
	},
	FARM_ARMOR_LEGGINGS: {
		skyblockId: 'FARM_ARMOR_LEGGINGS',
		name: 'Farm Armor Leggings',
		wiki: 'https://wiki.hypixel.net/Farm_Armor',
		upgrade: {
			id: 'MELON_LEGGINGS',
			reason: UpgradeReason.DeadEnd,
		},
		family: 'FARM_ARMOR',
		slot: GearSlot.Leggings,
		maxRarity: Rarity.Epic,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [],
			},
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
		baseStats: {
			[Stat.FarmingFortune]: 10,
		},
		skillReq: {
			[Skill.Farming]: 10,
		},
	},
	FARM_ARMOR_BOOTS: {
		skyblockId: 'FARM_ARMOR_BOOTS',
		name: 'Farm Armor Boots',
		wiki: 'https://wiki.hypixel.net/Farm_Armor',
		upgrade: {
			id: 'MELON_BOOTS',
			reason: UpgradeReason.DeadEnd,
		},
		family: 'FARM_ARMOR',
		slot: GearSlot.Boots,
		maxRarity: Rarity.Epic,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [],
			},
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
		baseStats: {
			[Stat.FarmingFortune]: 10,
		},
		skillReq: {
			[Skill.Farming]: 10,
		},
	},
	RABBIT_HELMET: {
		skyblockId: 'RABBIT_HELMET',
		name: 'Rabbit Helmet',
		wiki: 'https://wiki.hypixel.net/Rabbit_Armor',
		upgrade: {
			id: 'MELON_HELMET',
			reason: UpgradeReason.DeadEnd,
		},
		family: 'RABBIT',
		slot: GearSlot.Helmet,
		maxRarity: Rarity.Uncommon,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [],
			},
		],
		baseStats: {
			[Stat.FarmingFortune]: 15,
		},
		skillReq: {
			[Skill.Farming]: 15,
		},
	},
	RABBIT_CHESTPLATE: {
		skyblockId: 'RABBIT_CHESTPLATE',
		name: 'Rabbit Chestplate',
		wiki: 'https://wiki.hypixel.net/Rabbit_Armor',
		upgrade: {
			id: 'MELON_CHESTPLATE',
			reason: UpgradeReason.DeadEnd,
		},
		family: 'RABBIT',
		slot: GearSlot.Chestplate,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [],
			},
		],
		maxRarity: Rarity.Uncommon,
		baseStats: {
			[Stat.FarmingFortune]: 15,
		},
		skillReq: {
			[Skill.Farming]: 15,
		},
	},
	RABBIT_LEGGINGS: {
		skyblockId: 'RABBIT_LEGGINGS',
		name: 'Rabbit Leggings',
		wiki: 'https://wiki.hypixel.net/Rabbit_Armor',
		upgrade: {
			id: 'MELON_LEGGINGS',
			reason: UpgradeReason.DeadEnd,
		},
		family: 'RABBIT',
		slot: GearSlot.Leggings,
		maxRarity: Rarity.Uncommon,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [],
			},
		],
		baseStats: {
			[Stat.FarmingFortune]: 15,
		},
		skillReq: {
			[Skill.Farming]: 15,
		},
	},
	RABBIT_BOOTS: {
		skyblockId: 'RABBIT_BOOTS',
		name: 'Rabbit Boots',
		wiki: 'https://wiki.hypixel.net/Rabbit_Armor',
		upgrade: {
			id: 'MELON_BOOTS',
			reason: UpgradeReason.DeadEnd,
		},
		family: 'RABBIT',
		slot: GearSlot.Boots,
		maxRarity: Rarity.Uncommon,
		gemSlots: [
			{
				slot_type: 'PERIDOT',
				costs: [],
			},
		],
		baseStats: {
			[Stat.FarmingFortune]: 15,
		},
		skillReq: {
			[Skill.Farming]: 15,
		},
	},
	MELON_HELMET: {
		skyblockId: 'MELON_HELMET',
		name: 'Melon Helmet',
		wiki: 'https://wiki.hypixel.net/Melon_Armor',
		upgrade: {
			id: 'CROPIE_HELMET',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					ENCHANTED_HAY_BALE: 8,
					BOX_OF_SEEDS: 6,
					CROPIE: 20,
				},
			},
		},
		family: 'MELON',
		special: [SpecialCrop.Cropie],
		slot: GearSlot.Helmet,
		maxRarity: Rarity.Rare,
		baseStats: {
			[Stat.FarmingFortune]: 15,
		},
		skillReq: {
			[Skill.Farming]: 25,
		},
	},
	MELON_CHESTPLATE: {
		skyblockId: 'MELON_CHESTPLATE',
		name: 'Melon Chestplate',
		wiki: 'https://wiki.hypixel.net/Melon_Armor',
		upgrade: {
			id: 'CROPIE_CHESTPLATE',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					ENCHANTED_HAY_BALE: 8,
					BOX_OF_SEEDS: 6,
					CROPIE: 20,
					ENCHANTED_BAKED_POTATO: 45,
				},
			},
		},
		family: 'MELON',
		special: [SpecialCrop.Cropie],
		slot: GearSlot.Chestplate,
		maxRarity: Rarity.Rare,
		baseStats: {
			[Stat.FarmingFortune]: 20,
		},
		skillReq: {
			[Skill.Farming]: 25,
		},
	},
	MELON_LEGGINGS: {
		skyblockId: 'MELON_LEGGINGS',
		name: 'Melon Leggings',
		wiki: 'https://wiki.hypixel.net/Melon_Armor',
		upgrade: {
			id: 'CROPIE_LEGGINGS',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					ENCHANTED_HAY_BALE: 8,
					BOX_OF_SEEDS: 6,
					CROPIE: 20,
					ENCHANTED_GOLDEN_CARROT: 30,
				},
			},
		},
		family: 'MELON',
		special: [SpecialCrop.Cropie],
		slot: GearSlot.Leggings,
		maxRarity: Rarity.Rare,
		baseStats: {
			[Stat.FarmingFortune]: 20,
		},
		skillReq: {
			[Skill.Farming]: 25,
		},
	},
	MELON_BOOTS: {
		skyblockId: 'MELON_BOOTS',
		name: 'Melon Boots',
		wiki: 'https://wiki.hypixel.net/Melon_Armor',
		upgrade: {
			id: 'CROPIE_BOOTS',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					ENCHANTED_HAY_BALE: 16,
					CROPIE: 20,
				},
			},
		},
		family: 'MELON',
		special: [SpecialCrop.Cropie],
		slot: GearSlot.Boots,
		maxRarity: Rarity.Rare,
		baseStats: {
			[Stat.FarmingFortune]: 15,
		},
		skillReq: {
			[Skill.Farming]: 25,
		},
	},
	CROPIE_HELMET: {
		skyblockId: 'CROPIE_HELMET',
		name: 'Cropie Helmet',
		wiki: 'https://wiki.hypixel.net/Cropie_Armor',
		upgrade: {
			id: 'SQUASH_HELMET',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					SQUASH: 20,
					POLISHED_PUMPKIN: 8,
					ENCHANTED_MELON_BLOCK: 48,
				},
			},
		},
		family: 'CROPIE',
		special: [SpecialCrop.Squash],
		slot: GearSlot.Helmet,
		maxRarity: Rarity.Epic,
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
		baseStats: {
			[Stat.FarmingFortune]: 20,
		},
		skillReq: {
			[Skill.Farming]: 30,
		},
	},
	CROPIE_CHESTPLATE: {
		skyblockId: 'CROPIE_CHESTPLATE',
		name: 'Cropie Chestplate',
		wiki: 'https://wiki.hypixel.net/Cropie_Armor',
		upgrade: {
			id: 'SQUASH_CHESTPLATE',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					SQUASH: 20,
					POLISHED_PUMPKIN: 8,
					ENCHANTED_MELON_BLOCK: 48,
					ENCHANTED_COOKIE: 30,
				},
			},
		},
		family: 'CROPIE',
		special: [SpecialCrop.Squash],
		slot: GearSlot.Chestplate,
		maxRarity: Rarity.Epic,
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
		baseStats: {
			[Stat.FarmingFortune]: 25,
		},
		skillReq: {
			[Skill.Farming]: 30,
		},
	},
	CROPIE_LEGGINGS: {
		skyblockId: 'CROPIE_LEGGINGS',
		name: 'Cropie Leggings',
		wiki: 'https://wiki.hypixel.net/Cropie_Armor',
		upgrade: {
			id: 'SQUASH_LEGGINGS',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					SQUASH: 20,
					POLISHED_PUMPKIN: 8,
					ENCHANTED_MELON_BLOCK: 48,
					ENCHANTED_COOKIE: 20,
				},
			},
		},
		family: 'CROPIE',
		special: [SpecialCrop.Squash],
		slot: GearSlot.Leggings,
		maxRarity: Rarity.Epic,
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
		baseStats: {
			[Stat.FarmingFortune]: 25,
		},
		skillReq: {
			[Skill.Farming]: 30,
		},
	},
	CROPIE_BOOTS: {
		skyblockId: 'CROPIE_BOOTS',
		name: 'Cropie Boots',
		wiki: 'https://wiki.hypixel.net/Cropie_Armor',
		upgrade: {
			id: 'SQUASH_BOOTS',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					SQUASH: 20,
					POLISHED_PUMPKIN: 12,
				},
			},
		},
		family: 'CROPIE',
		special: [SpecialCrop.Squash],
		slot: GearSlot.Boots,
		maxRarity: Rarity.Epic,
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
		baseStats: {
			[Stat.FarmingFortune]: 20,
		},
		skillReq: {
			[Skill.Farming]: 30,
		},
	},
	SQUASH_HELMET: {
		skyblockId: 'SQUASH_HELMET',
		name: 'Squash Helmet',
		wiki: 'https://wiki.hypixel.net/Squash_Armor',
		upgrade: {
			id: 'FERMENTO_HELMET',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					CONDENSED_FERMENTO: 2,
					ENCHANTED_SUGAR_CANE: 32,
					ENCHANTED_HUGE_MUSHROOM_2: 32,
					ENCHANTED_HUGE_MUSHROOM_1: 32,
				},
			},
		},
		family: 'SQUASH',
		special: [SpecialCrop.Fermento],
		slot: GearSlot.Helmet,
		maxRarity: Rarity.Legendary,
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
		baseStats: {
			[Stat.FarmingFortune]: 25,
		},
		skillReq: {
			[Skill.Farming]: 35,
		},
	},
	SQUASH_CHESTPLATE: {
		skyblockId: 'SQUASH_CHESTPLATE',
		name: 'Squash Chestplate',
		wiki: 'https://wiki.hypixel.net/Squash_Armor',
		upgrade: {
			id: 'FERMENTO_CHESTPLATE',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					CONDENSED_FERMENTO: 2,
					ENCHANTED_SUGAR_CANE: 32,
					ENCHANTED_HUGE_MUSHROOM_2: 32,
					ENCHANTED_HUGE_MUSHROOM_1: 32,
					MUTANT_NETHER_STALK: 30,
					ENCHANTED_CACTUS: 25,
				},
			},
		},
		family: 'SQUASH',
		special: [SpecialCrop.Fermento],
		slot: GearSlot.Chestplate,
		maxRarity: Rarity.Legendary,
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
		baseStats: {
			[Stat.FarmingFortune]: 30,
		},
		skillReq: {
			[Skill.Farming]: 35,
		},
	},
	SQUASH_LEGGINGS: {
		skyblockId: 'SQUASH_LEGGINGS',
		name: 'Squash Leggings',
		wiki: 'https://wiki.hypixel.net/Squash_Armor',
		upgrade: {
			id: 'FERMENTO_LEGGINGS',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					CONDENSED_FERMENTO: 2,
					ENCHANTED_SUGAR_CANE: 32,
					ENCHANTED_HUGE_MUSHROOM_2: 32,
					ENCHANTED_HUGE_MUSHROOM_1: 32,
					MUTANT_NETHER_STALK: 40,
				},
			},
		},
		family: 'SQUASH',
		special: [SpecialCrop.Fermento],
		slot: GearSlot.Leggings,
		maxRarity: Rarity.Legendary,
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
		baseStats: {
			[Stat.FarmingFortune]: 30,
		},
		skillReq: {
			[Skill.Farming]: 35,
		},
	},
	SQUASH_BOOTS: {
		skyblockId: 'SQUASH_BOOTS',
		name: 'Squash Boots',
		wiki: 'https://wiki.hypixel.net/Squash_Armor',
		upgrade: {
			id: 'FERMENTO_BOOTS',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					CONDENSED_FERMENTO: 2,
					ENCHANTED_HUGE_MUSHROOM_2: 32,
					ENCHANTED_HUGE_MUSHROOM_1: 32,
				},
			},
		},
		family: 'SQUASH',
		special: [SpecialCrop.Fermento],
		slot: GearSlot.Boots,
		maxRarity: Rarity.Legendary,
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
		baseStats: {
			[Stat.FarmingFortune]: 25,
		},
		skillReq: {
			[Skill.Farming]: 35,
		},
	},
	FERMENTO_HELMET: {
		skyblockId: 'FERMENTO_HELMET',
		name: 'Fermento Helmet',
		wiki: 'https://wiki.hypixel.net/Fermento_Armor',
		family: 'FERMENTO',
		special: [SpecialCrop.Cropie, SpecialCrop.Squash, SpecialCrop.Fermento],
		slot: GearSlot.Helmet,
		maxRarity: Rarity.Mythic,
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
		baseStats: {
			[Stat.FarmingFortune]: 30,
		},
		skillReq: {
			[Skill.Farming]: 40,
		},
	},
	FERMENTO_CHESTPLATE: {
		skyblockId: 'FERMENTO_CHESTPLATE',
		name: 'Fermento Chestplate',
		wiki: 'https://wiki.hypixel.net/Fermento_Armor',
		family: 'FERMENTO',
		special: [SpecialCrop.Cropie, SpecialCrop.Squash, SpecialCrop.Fermento],
		slot: GearSlot.Chestplate,
		maxRarity: Rarity.Mythic,
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
		baseStats: {
			[Stat.FarmingFortune]: 35,
		},
		skillReq: {
			[Skill.Farming]: 40,
		},
	},
	FERMENTO_LEGGINGS: {
		skyblockId: 'FERMENTO_LEGGINGS',
		name: 'Fermento Leggings',
		wiki: 'https://wiki.hypixel.net/Fermento_Armor',
		family: 'FERMENTO',
		special: [SpecialCrop.Cropie, SpecialCrop.Squash, SpecialCrop.Fermento],
		slot: GearSlot.Leggings,
		maxRarity: Rarity.Mythic,
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
		baseStats: {
			[Stat.FarmingFortune]: 35,
		},
		skillReq: {
			[Skill.Farming]: 40,
		},
	},
	FERMENTO_BOOTS: {
		skyblockId: 'FERMENTO_BOOTS',
		name: 'Fermento Boots',
		wiki: 'https://wiki.hypixel.net/Fermento_Armor',
		upgrade: {
			id: 'RANCHERS_BOOTS',
			reason: UpgradeReason.Situational,
			why: "Rancher's Boots provide less farming fortune, but allow you to control your speed for tricky farms.",
		},
		family: 'FERMENTO',
		special: [SpecialCrop.Cropie, SpecialCrop.Squash, SpecialCrop.Fermento],
		slot: GearSlot.Boots,
		maxRarity: Rarity.Mythic,
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
		baseStats: {
			[Stat.FarmingFortune]: 30,
		},
		skillReq: {
			[Skill.Farming]: 40,
		},
	},
};

export type ArmorSetBonusStats = Partial<Record<number, Partial<Record<Stat, number>>>>;

export interface ArmorSetBonus {
	name: string;
	piecePotential?: Partial<Record<Stat, number>>;
	stats: ArmorSetBonusStats;
	special?: SpecialCrop[];
}

export const ARMOR_SET_BONUS: Record<string, ArmorSetBonus> = {
	RABBIT: {
		name: 'Bonus Farming Fortune',
		stats: {
			4: {
				[Stat.FarmingFortune]: 10,
			},
		},
	},
	MELON: {
		name: 'Cropier Crops',
		piecePotential: {
			[Stat.FarmingFortune]: 10,
		},
		stats: {
			2: {
				[Stat.FarmingFortune]: 10,
			},
			3: {
				[Stat.FarmingFortune]: 20,
			},
			4: {
				[Stat.FarmingFortune]: 30,
			},
		},
		special: [SpecialCrop.Cropie],
	},
	CROPIE: {
		name: 'Squashbuckle',
		piecePotential: {
			[Stat.FarmingFortune]: 15,
		},
		stats: {
			2: {
				[Stat.FarmingFortune]: 15,
			},
			3: {
				[Stat.FarmingFortune]: 30,
			},
			4: {
				[Stat.FarmingFortune]: 45,
			},
		},
		special: [SpecialCrop.Squash],
	},
	SQUASH: {
		name: 'Mento Fermento',
		piecePotential: {
			[Stat.FarmingFortune]: 20,
		},
		stats: {
			2: {
				[Stat.FarmingFortune]: 20,
			},
			3: {
				[Stat.FarmingFortune]: 40,
			},
			4: {
				[Stat.FarmingFortune]: 60,
			},
		},
		special: [SpecialCrop.Fermento],
	},
	FERMENTO: {
		name: 'Feast',
		piecePotential: {
			[Stat.FarmingFortune]: 25,
		},
		stats: {
			2: {
				[Stat.FarmingFortune]: 25,
			},
			3: {
				[Stat.FarmingFortune]: 50,
			},
			4: {
				[Stat.FarmingFortune]: 75,
			},
		},
		special: [SpecialCrop.Cropie, SpecialCrop.Squash, SpecialCrop.Fermento],
	},
	PESTHUNTERS: {
		name: 'Eradicator',
		stats: {
			2: {
				[Stat.FarmingFortune]: 50,
			},
			3: {
				[Stat.FarmingFortune]: 75,
			},
			4: {
				[Stat.FarmingFortune]: 100,
			},
		},
	},
};
