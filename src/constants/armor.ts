import { Rarity, ReforgeTarget, Stat } from './reforges';
import { Skill } from './skills';
import { SpecialCrop } from './specialcrops';

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

export interface FarmingArmorInfo {
	special?: SpecialCrop[];
	slot: GearSlot;
	family?: string;
	name: string;
	maxRarity: Rarity;
	upgrade?: string;
	wiki: string;
	stats?: Partial<Record<Stat, number>>;
	perLevelStats?: {
		skill: Skill;
		appliesTo?: ReforgeTarget[];
		stats: Partial<Record<Stat, number>>;
	};
	skillReq?: Partial<Record<Skill, number>>;
}

export const ARMOR_INFO: Record<string, FarmingArmorInfo> = {
	FARMER_BOOTS: {
		name: 'Farmer Boots',
		upgrade: 'RANCHERS_BOOTS',
		wiki: 'https://wiki.hypixel.net/Farmer_Boots',
		maxRarity: Rarity.Rare,
		slot: GearSlot.Boots,
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
		name: "Rancher's Boots",
		wiki: 'https://wiki.hypixel.net/Rancher%27s_Boots',
		maxRarity: Rarity.Legendary,
		slot: GearSlot.Boots,
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
		name: 'Lantern Helmet',
		wiki: 'https://wiki.hypixel.net/Lantern_Helmet',
		maxRarity: Rarity.Rare,
		slot: GearSlot.Helmet,
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
		name: 'Farm Armor Helmet',
		wiki: 'https://wiki.hypixel.net/Farm_Armor',
		family: 'FARM_ARMOR',
		slot: GearSlot.Helmet,
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 10,
		},
		skillReq: {
			[Skill.Farming]: 10,
		},
	},
	FARM_ARMOR_CHESTPLATE: {
		name: 'Farm Armor Chestplate',
		wiki: 'https://wiki.hypixel.net/Farm_Armor',
		family: 'FARM_ARMOR',
		slot: GearSlot.Chestplate,
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 10,
		},
		skillReq: {
			[Skill.Farming]: 10,
		},
	},
	FARM_ARMOR_LEGGINGS: {
		name: 'Farm Armor Leggings',
		wiki: 'https://wiki.hypixel.net/Farm_Armor',
		family: 'FARM_ARMOR',
		slot: GearSlot.Leggings,
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 10,
		},
		skillReq: {
			[Skill.Farming]: 10,
		},
	},
	FARM_ARMOR_BOOTS: {
		name: 'Farm Armor Boots',
		wiki: 'https://wiki.hypixel.net/Farm_Armor',
		family: 'FARM_ARMOR',
		slot: GearSlot.Boots,
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 10,
		},
		skillReq: {
			[Skill.Farming]: 10,
		},
	},
	RABBIT_HELMET: {
		name: 'Rabbit Helmet',
		wiki: 'https://wiki.hypixel.net/Rabbit_Armor',
		family: 'RABBIT',
		slot: GearSlot.Helmet,
		maxRarity: Rarity.Uncommon,
		stats: {
			[Stat.FarmingFortune]: 15,
		},
		skillReq: {
			[Skill.Farming]: 15,
		},
	},
	RABBIT_CHESTPLATE: {
		name: 'Rabbit Chestplate',
		wiki: 'https://wiki.hypixel.net/Rabbit_Armor',
		family: 'RABBIT',
		slot: GearSlot.Chestplate,
		maxRarity: Rarity.Uncommon,
		stats: {
			[Stat.FarmingFortune]: 15,
		},
		skillReq: {
			[Skill.Farming]: 15,
		},
	},
	RABBIT_LEGGINGS: {
		name: 'Rabbit Leggings',
		wiki: 'https://wiki.hypixel.net/Rabbit_Armor',
		family: 'RABBIT',
		slot: GearSlot.Leggings,
		maxRarity: Rarity.Uncommon,
		stats: {
			[Stat.FarmingFortune]: 15,
		},
		skillReq: {
			[Skill.Farming]: 15,
		},
	},
	RABBIT_BOOTS: {
		name: 'Rabbit Boots',
		wiki: 'https://wiki.hypixel.net/Rabbit_Armor',
		family: 'RABBIT',
		slot: GearSlot.Boots,
		maxRarity: Rarity.Uncommon,
		stats: {
			[Stat.FarmingFortune]: 15,
		},
		skillReq: {
			[Skill.Farming]: 15,
		},
	},
	MELON_HELMET: {
		name: 'Melon Helmet',
		wiki: 'https://wiki.hypixel.net/Melon_Armor',
		upgrade: 'CROPIE_HELMET',
		family: 'MELON',
		special: [SpecialCrop.Cropie],
		slot: GearSlot.Helmet,
		maxRarity: Rarity.Rare,
		stats: {
			[Stat.FarmingFortune]: 15,
		},
		skillReq: {
			[Skill.Farming]: 25,
		},
	},
	MELON_CHESTPLATE: {
		name: 'Melon Chestplate',
		wiki: 'https://wiki.hypixel.net/Melon_Armor',
		upgrade: 'CROPIE_CHESTPLATE',
		family: 'MELON',
		special: [SpecialCrop.Cropie],
		slot: GearSlot.Chestplate,
		maxRarity: Rarity.Rare,
		stats: {
			[Stat.FarmingFortune]: 20,
		},
		skillReq: {
			[Skill.Farming]: 25,
		},
	},
	MELON_LEGGINGS: {
		name: 'Melon Leggings',
		wiki: 'https://wiki.hypixel.net/Melon_Armor',
		upgrade: 'CROPIE_LEGGINGS',
		family: 'MELON',
		special: [SpecialCrop.Cropie],
		slot: GearSlot.Leggings,
		maxRarity: Rarity.Rare,
		stats: {
			[Stat.FarmingFortune]: 20,
		},
		skillReq: {
			[Skill.Farming]: 25,
		},
	},
	MELON_BOOTS: {
		name: 'Melon Boots',
		wiki: 'https://wiki.hypixel.net/Melon_Armor',
		upgrade: 'CROPIE_BOOTS',
		family: 'MELON',
		special: [SpecialCrop.Cropie],
		slot: GearSlot.Boots,
		maxRarity: Rarity.Rare,
		stats: {
			[Stat.FarmingFortune]: 15,
		},
		skillReq: {
			[Skill.Farming]: 25,
		},
	},
	CROPIE_HELMET: {
		name: 'Cropie Helmet',
		wiki: 'https://wiki.hypixel.net/Cropie_Armor',
		upgrade: 'SQUASH_HELMET',
		family: 'CROPIE',
		special: [SpecialCrop.Squash],
		slot: GearSlot.Helmet,
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 20,
		},
		skillReq: {
			[Skill.Farming]: 30,
		},
	},
	CROPIE_CHESTPLATE: {
		name: 'Cropie Chestplate',
		wiki: 'https://wiki.hypixel.net/Cropie_Armor',
		upgrade: 'SQUASH_CHESTPLATE',
		family: 'CROPIE',
		special: [SpecialCrop.Squash],
		slot: GearSlot.Chestplate,
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 25,
		},
		skillReq: {
			[Skill.Farming]: 30,
		},
	},
	CROPIE_LEGGINGS: {
		name: 'Cropie Leggings',
		wiki: 'https://wiki.hypixel.net/Cropie_Armor',
		upgrade: 'SQUASH_LEGGINGS',
		family: 'CROPIE',
		special: [SpecialCrop.Squash],
		slot: GearSlot.Leggings,
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 25,
		},
		skillReq: {
			[Skill.Farming]: 30,
		},
	},
	CROPIE_BOOTS: {
		name: 'Cropie Boots',
		wiki: 'https://wiki.hypixel.net/Cropie_Armor',
		upgrade: 'SQUASH_BOOTS',
		family: 'CROPIE',
		special: [SpecialCrop.Squash],
		slot: GearSlot.Boots,
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 20,
		},
		skillReq: {
			[Skill.Farming]: 30,
		},
	},
	SQUASH_HELMET: {
		name: 'Squash Helmet',
		wiki: 'https://wiki.hypixel.net/Squash_Armor',
		upgrade: 'FERMENTO_HELMET',
		family: 'SQUASH',
		special: [SpecialCrop.Fermento],
		slot: GearSlot.Helmet,
		maxRarity: Rarity.Legendary,
		stats: {
			[Stat.FarmingFortune]: 25,
		},
		skillReq: {
			[Skill.Farming]: 35,
		},
	},
	SQUASH_CHESTPLATE: {
		name: 'Squash Chestplate',
		wiki: 'https://wiki.hypixel.net/Squash_Armor',
		upgrade: 'FERMENTO_CHESTPLATE',
		family: 'SQUASH',
		special: [SpecialCrop.Fermento],
		slot: GearSlot.Chestplate,
		maxRarity: Rarity.Legendary,
		stats: {
			[Stat.FarmingFortune]: 30,
		},
		skillReq: {
			[Skill.Farming]: 35,
		},
	},
	SQUASH_LEGGINGS: {
		name: 'Squash Leggings',
		wiki: 'https://wiki.hypixel.net/Squash_Armor',
		upgrade: 'FERMENTO_LEGGINGS',
		family: 'SQUASH',
		special: [SpecialCrop.Fermento],
		slot: GearSlot.Leggings,
		maxRarity: Rarity.Legendary,
		stats: {
			[Stat.FarmingFortune]: 30,
		},
		skillReq: {
			[Skill.Farming]: 35,
		},
	},
	SQUASH_BOOTS: {
		name: 'Squash Boots',
		wiki: 'https://wiki.hypixel.net/Squash_Armor',
		upgrade: 'FERMENTO_BOOTS',
		family: 'SQUASH',
		special: [SpecialCrop.Fermento],
		slot: GearSlot.Boots,
		maxRarity: Rarity.Legendary,
		stats: {
			[Stat.FarmingFortune]: 25,
		},
		skillReq: {
			[Skill.Farming]: 35,
		},
	},
	FERMENTO_HELMET: {
		name: 'Fermento Helmet',
		wiki: 'https://wiki.hypixel.net/Fermento_Armor',
		family: 'FERMENTO',
		special: [SpecialCrop.Cropie, SpecialCrop.Squash, SpecialCrop.Fermento],
		slot: GearSlot.Helmet,
		maxRarity: Rarity.Legendary,
		stats: {
			[Stat.FarmingFortune]: 30,
		},
		skillReq: {
			[Skill.Farming]: 40,
		},
	},
	FERMENTO_CHESTPLATE: {
		name: 'Fermento Chestplate',
		wiki: 'https://wiki.hypixel.net/Fermento_Armor',
		family: 'FERMENTO',
		special: [SpecialCrop.Cropie, SpecialCrop.Squash, SpecialCrop.Fermento],
		slot: GearSlot.Chestplate,
		maxRarity: Rarity.Legendary,
		stats: {
			[Stat.FarmingFortune]: 35,
		},
		skillReq: {
			[Skill.Farming]: 40,
		},
	},
	FERMENTO_LEGGINGS: {
		name: 'Fermento Leggings',
		wiki: 'https://wiki.hypixel.net/Fermento_Armor',
		family: 'FERMENTO',
		special: [SpecialCrop.Cropie, SpecialCrop.Squash, SpecialCrop.Fermento],
		slot: GearSlot.Leggings,
		maxRarity: Rarity.Legendary,
		stats: {
			[Stat.FarmingFortune]: 35,
		},
		skillReq: {
			[Skill.Farming]: 40,
		},
	},
	FERMENTO_BOOTS: {
		name: 'Fermento Boots',
		wiki: 'https://wiki.hypixel.net/Fermento_Armor',
		family: 'FERMENTO',
		special: [SpecialCrop.Cropie, SpecialCrop.Squash, SpecialCrop.Fermento],
		slot: GearSlot.Boots,
		maxRarity: Rarity.Legendary,
		stats: {
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
};
