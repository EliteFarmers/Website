import { ReforgeTarget, Stat } from "./reforges";

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
	'harvesting': {
		name: 'Harvesting',
		appliesTo: [ ReforgeTarget.Hoe ],
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
	'cultivating': {
		name: 'Cultivating',
		appliesTo: [ ReforgeTarget.Hoe, ReforgeTarget.Axe ],
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
	'dedication': {
		name: 'Dedication',
		appliesTo: [ ReforgeTarget.Hoe, ReforgeTarget.Axe ],
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
} as const;