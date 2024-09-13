import { Crop } from './crops';
import { ReforgeTarget, Stat } from './reforges';

export interface FarmingEnchant {
	name: string;
	appliesTo: readonly ReforgeTarget[];
	wiki: string;
	minLevel: number;
	maxLevel: number;
	levels?: Record<number, Partial<Record<Stat, number>>>;
	multipliedLevels?: Record<number, Partial<Record<Stat, number>>>;
	levelRequirement?: number;
}

export const FARMING_ENCHANTS: Record<string, FarmingEnchant> = {
	harvesting: {
		name: 'Harvesting',
		appliesTo: [ReforgeTarget.Hoe],
		wiki: 'https://wiki.hypixel.net/Harvesting_Enchantment',
		levelRequirement: 2,
		minLevel: 1,
		maxLevel: 6,
		levels: {
			1: {
				[Stat.FarmingFortune]: 12.5,
			},
			2: {
				[Stat.FarmingFortune]: 25,
			},
			3: {
				[Stat.FarmingFortune]: 37.5,
			},
			4: {
				[Stat.FarmingFortune]: 50,
			},
			5: {
				[Stat.FarmingFortune]: 62.5,
			},
			6: {
				[Stat.FarmingFortune]: 75,
			},
		},
	},
	cultivating: {
		name: 'Cultivating',
		appliesTo: [ReforgeTarget.Hoe, ReforgeTarget.Axe],
		wiki: 'https://wiki.hypixel.net/Cultivating_Enchantment',
		minLevel: 1,
		maxLevel: 10,
		levels: {
			1: {
				[Stat.FarmingWisdom]: 1,
				[Stat.FarmingFortune]: 2,
			},
			2: {
				[Stat.FarmingWisdom]: 2,
				[Stat.FarmingFortune]: 4,
			},
			3: {
				[Stat.FarmingWisdom]: 3,
				[Stat.FarmingFortune]: 6,
			},
			4: {
				[Stat.FarmingWisdom]: 4,
				[Stat.FarmingFortune]: 8,
			},
			5: {
				[Stat.FarmingWisdom]: 5,
				[Stat.FarmingFortune]: 10,
			},
			6: {
				[Stat.FarmingWisdom]: 6,
				[Stat.FarmingFortune]: 12,
			},
			7: {
				[Stat.FarmingWisdom]: 7,
				[Stat.FarmingFortune]: 14,
			},
			8: {
				[Stat.FarmingWisdom]: 8,
				[Stat.FarmingFortune]: 16,
			},
			9: {
				[Stat.FarmingWisdom]: 9,
				[Stat.FarmingFortune]: 18,
			},
			10: {
				[Stat.FarmingWisdom]: 10,
				[Stat.FarmingFortune]: 20,
			},
		},
	},
	dedication: {
		name: 'Dedication',
		appliesTo: [ReforgeTarget.Hoe, ReforgeTarget.Axe],
		wiki: 'https://wiki.hypixel.net/Dedication_Enchantment',
		minLevel: 1,
		maxLevel: 4,
		multipliedLevels: {
			1: {
				[Stat.FarmingFortune]: 0.5,
			},
			2: {
				[Stat.FarmingFortune]: 0.75,
			},
			3: {
				[Stat.FarmingFortune]: 1,
			},
			4: {
				[Stat.FarmingFortune]: 2,
			},
		},
	},
	sunder: {
		name: 'Sunder',
		appliesTo: [ReforgeTarget.Axe],
		wiki: 'https://wiki.hypixel.net/Sunder_Enchantment',
		minLevel: 1,
		maxLevel: 6,
		levels: {
			1: {
				[Stat.FarmingFortune]: 12.5,
			},
			2: {
				[Stat.FarmingFortune]: 25,
			},
			3: {
				[Stat.FarmingFortune]: 37.5,
			},
			4: {
				[Stat.FarmingFortune]: 50,
			},
			5: {
				[Stat.FarmingFortune]: 62.5,
			},
			6: {
				[Stat.FarmingFortune]: 75,
			},
		},
	},
} as const;

export const FARMING_ARMOR_ENCHANTS: Record<string, FarmingEnchant> = {
	pesterminator: {
		name: 'Pesterminator',
		appliesTo: [ReforgeTarget.Armor],
		wiki: 'https://wiki.hypixel.net/Pesterminator_Enchantment',
		levelRequirement: 10,
		minLevel: 1,
		maxLevel: 5,
		levels: {
			1: {
				[Stat.FarmingFortune]: 1,
				[Stat.BonusPestChance]: 2,
			},
			2: {
				[Stat.FarmingFortune]: 2,
				[Stat.BonusPestChance]: 4,
			},
			3: {
				[Stat.FarmingFortune]: 3,
				[Stat.BonusPestChance]: 6,
			},
			4: {
				[Stat.FarmingFortune]: 4,
				[Stat.BonusPestChance]: 8,
			},
			5: {
				[Stat.FarmingFortune]: 5,
				[Stat.BonusPestChance]: 10,
			},
		},
	},
} as const;

export const EQUIPMENT_ENCHANTS: Record<string, FarmingEnchant> = {
	green_thumb: {
		name: 'Green Thumb',
		appliesTo: [ReforgeTarget.Equipment],
		wiki: 'https://wiki.hypixel.net/Green_Thumb_Enchantment',
		levelRequirement: 24,
		minLevel: 1,
		maxLevel: 5,
		multipliedLevels: {
			1: {
				[Stat.FarmingFortune]: 0.05
			},
			2: {
				[Stat.FarmingFortune]: 0.1
			},
			3: {
				[Stat.FarmingFortune]: 0.15
			},
			4: {
				[Stat.FarmingFortune]: 0.2
			},
			5: {
				[Stat.FarmingFortune]: 0.25
			},
		},
	},
} as const;

export const TURBO_ENCHANTS: Record<string, Crop> = {
	turbo_cactus: Crop.Cactus,
	turbo_cane: Crop.SugarCane,
	turbo_carrot: Crop.Carrot,
	turbo_coco: Crop.CocoaBeans,
	turbo_melon: Crop.Melon,
	turbo_mushrooms: Crop.Mushroom,
	turbo_potato: Crop.Potato,
	turbo_pumpkin: Crop.Pumpkin,
	turbo_warts: Crop.NetherWart,
	turbo_wheat: Crop.Wheat,
};

export const TURBO_ENCHANT_FORTUNE = 5;
