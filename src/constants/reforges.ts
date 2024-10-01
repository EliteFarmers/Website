import { Stat } from "./stats";

export type RarityRecord<T> = Partial<Record<Rarity, T>>;

export enum Rarity {
	Common = 'Common',
	Uncommon = 'Uncommon',
	Rare = 'Rare',
	Epic = 'Epic',
	Legendary = 'Legendary',
	Mythic = 'Mythic',
	Divine = 'Divine',
	Special = 'Special',
	VerySpecial = 'Very Special',
	Ultimate = 'Ultimate',
	Admin = 'Admin',
}

export const RARITY_VALUES = {
	[Rarity.Common]: 1,
	[Rarity.Uncommon]: 2,
	[Rarity.Rare]: 3,
	[Rarity.Epic]: 4,
	[Rarity.Legendary]: 5,
	[Rarity.Mythic]: 6,
	[Rarity.Divine]: 7,
	[Rarity.Special]: 8,
	[Rarity.VerySpecial]: 9,
	[Rarity.Ultimate]: 10,
	[Rarity.Admin]: 11,
}

export function compareRarity(a: Rarity | string, b: Rarity | string) {
	return RARITY_VALUES[a as Rarity] - RARITY_VALUES[b as Rarity];
}

export enum ReforgeTarget {
	Hoe = 'Hoe',
	Axe = 'Axe',
	Armor = 'Armor',
	Equipment = 'Equipment',
	Sword = 'Sword',
}

export interface ReforgeTier {
	stats: Partial<Record<Stat, number>>;
	cost: number;
}

export type ReforgeTiers = Record<Rarity, ReforgeTier>;

export interface Reforge {
	name: string;
	wiki: string;
	stone?: {
		name: string;
		id: string;
		npc?: number;
		copper?: number;
	};
	appliesTo?: ReforgeTarget[];
	tiers: Partial<ReforgeTiers>;
}

export const REFORGES: Partial<Record<string, Reforge>> = {
	bountiful: {
		name: 'Bountiful',
		wiki: 'https://wiki.hypixel.net/Golden_Ball',
		appliesTo: [ReforgeTarget.Hoe, ReforgeTarget.Axe],
		stone: {
			name: 'Golden Ball',
			id: 'GOLDEN_BALL',
			npc: 1_000_000,
		},
		tiers: {
			[Rarity.Common]: {
				stats: {
					[Stat.FarmingFortune]: 1,
					[Stat.Speed]: 1,
				},
				cost: 20_000,
			},
			[Rarity.Uncommon]: {
				stats: {
					[Stat.FarmingFortune]: 2,
					[Stat.Speed]: 2,
				},
				cost: 40_000,
			},
			[Rarity.Rare]: {
				stats: {
					[Stat.FarmingFortune]: 3,
					[Stat.Speed]: 3,
				},
				cost: 80_000,
			},
			[Rarity.Epic]: {
				stats: {
					[Stat.FarmingFortune]: 5,
					[Stat.Speed]: 5,
				},
				cost: 150_000,
			},
			[Rarity.Legendary]: {
				stats: {
					[Stat.FarmingFortune]: 7,
					[Stat.Speed]: 8,
				},
				cost: 300_000,
			},
			[Rarity.Mythic]: {
				stats: {
					[Stat.FarmingFortune]: 10,
					[Stat.Speed]: 13,
				},
				cost: 600_000,
			},
		},
	},
	blessed: {
		name: 'Blessed',
		wiki: 'https://wiki.hypixel.net/Blessed_Fruit',
		appliesTo: [ReforgeTarget.Hoe, ReforgeTarget.Axe],
		stone: {
			name: 'Blessed Fruit',
			id: 'BLESSED_FRUIT',
			npc: 1_000_000,
		},
		tiers: {
			[Rarity.Common]: {
				stats: {
					[Stat.FarmingFortune]: 5,
					[Stat.FarmingWisdom]: 1,
					[Stat.Speed]: 5,
				},
				cost: 10_000,
			},
			[Rarity.Uncommon]: {
				stats: {
					[Stat.FarmingFortune]: 7,
					[Stat.FarmingWisdom]: 2,
					[Stat.Speed]: 7,
				},
				cost: 10_000,
			},
			[Rarity.Rare]: {
				stats: {
					[Stat.FarmingFortune]: 9,
					[Stat.FarmingWisdom]: 3,
					[Stat.Speed]: 9,
				},
				cost: 10_000,
			},
			[Rarity.Epic]: {
				stats: {
					[Stat.FarmingFortune]: 13,
					[Stat.FarmingWisdom]: 4,
					[Stat.Speed]: 13,
				},
				cost: 10_000,
			},
			[Rarity.Legendary]: {
				stats: {
					[Stat.FarmingFortune]: 16,
					[Stat.FarmingWisdom]: 5,
					[Stat.Speed]: 16,
				},
				cost: 10_000,
			},
			[Rarity.Mythic]: {
				stats: {
					[Stat.FarmingFortune]: 20,
					[Stat.FarmingWisdom]: 6,
					[Stat.Speed]: 20,
				},
				cost: 10_000,
			},
		},
	},
	earthy: {
		name: 'Earthy',
		wiki: 'https://wiki.hypixel.net/Large_Walnut',
		appliesTo: [ReforgeTarget.Axe],
		stone: {
			name: 'Large Walnut',
			id: 'LARGE_WALNUT',
			copper: 150,
		},
		tiers: {
			[Rarity.Common]: {
				stats: {
					[Stat.FarmingFortune]: 2,
					[Stat.Speed]: 1,
				},
				cost: 5_000,
			},
			[Rarity.Uncommon]: {
				stats: {
					[Stat.FarmingFortune]: 4,
					[Stat.Speed]: 1,
				},
				cost: 10_000,
			},
			[Rarity.Rare]: {
				stats: {
					[Stat.FarmingFortune]: 6,
					[Stat.Speed]: 1,
				},
				cost: 20_000,
			},
			[Rarity.Epic]: {
				stats: {
					[Stat.FarmingFortune]: 8,
					[Stat.Speed]: 1,
				},
				cost: 50_000,
			},
			[Rarity.Legendary]: {
				stats: {
					[Stat.FarmingFortune]: 10,
					[Stat.Speed]: 1,
				},
				cost: 100_000,
			},
			[Rarity.Mythic]: {
				stats: {
					[Stat.FarmingFortune]: 12,
					[Stat.Speed]: 1,
				},
				cost: 200_000,
			},
		},
	},
	bustling: {
		name: 'Bustling',
		wiki: 'https://wiki.hypixel.net/SkyMart_Brochure',
		appliesTo: [ReforgeTarget.Armor],
		stone: {
			name: 'SkyMart Brochure',
			id: 'SKYMART_BROCHURE',
			copper: 100,
		},
		tiers: {
			[Rarity.Common]: {
				stats: {
					[Stat.FarmingFortune]: 1,
				},
				cost: 1_000,
			},
			[Rarity.Uncommon]: {
				stats: {
					[Stat.FarmingFortune]: 2,
				},
				cost: 2_000,
			},
			[Rarity.Rare]: {
				stats: {
					[Stat.FarmingFortune]: 4,
				},
				cost: 3_000,
			},
			[Rarity.Epic]: {
				stats: {
					[Stat.FarmingFortune]: 6,
				},
				cost: 6_000,
			},
			[Rarity.Legendary]: {
				stats: {
					[Stat.FarmingFortune]: 8,
				},
				cost: 10_000,
			},
			[Rarity.Mythic]: {
				stats: {
					[Stat.FarmingFortune]: 10,
				},
				cost: 15_000,
			},
		},
	},
	mossy: {
		name: 'Mossy',
		wiki: 'https://wiki.hypixel.net/Overgrown_Grass',
		appliesTo: [ReforgeTarget.Armor],
		stone: {
			name: 'Overgrown Grass',
			id: 'OVERGROWN_GRASS',
			copper: 150,
		},
		tiers: {
			[Rarity.Common]: {
				stats: {
					[Stat.FarmingFortune]: 5,
					[Stat.Speed]: 3,
				},
				cost: 20_000,
			},
			[Rarity.Uncommon]: {
				stats: {
					[Stat.FarmingFortune]: 10,
					[Stat.Speed]: 3,
				},
				cost: 40_000,
			},
			[Rarity.Rare]: {
				stats: {
					[Stat.FarmingFortune]: 15,
					[Stat.Speed]: 5,
				},
				cost: 80_000,
			},
			[Rarity.Epic]: {
				stats: {
					[Stat.FarmingFortune]: 20,
					[Stat.Speed]: 5,
				},
				cost: 150_000,
			},
			[Rarity.Legendary]: {
				stats: {
					[Stat.FarmingFortune]: 25,
					[Stat.Speed]: 7,
				},
				cost: 300_000,
			},
			[Rarity.Mythic]: {
				stats: {
					[Stat.FarmingFortune]: 30,
					[Stat.Speed]: 7,
				},
				cost: 600_000,
			},
		},
	},
	blooming: {
		name: 'Blooming',
		wiki: 'https://wiki.hypixel.net/Flowering_Bouquet',
		appliesTo: [ReforgeTarget.Armor],
		stone: {
			name: 'Flowering Bouquet',
			id: 'FLOWERING_BOUQUET',
		},
		tiers: {
			[Rarity.Common]: {
				stats: {
					[Stat.FarmingFortune]: 1,
					[Stat.Speed]: 4,
				},
				cost: 5_000,
			},
			[Rarity.Uncommon]: {
				stats: {
					[Stat.FarmingFortune]: 2,
					[Stat.Speed]: 4,
				},
				cost: 10_000,
			},
			[Rarity.Rare]: {
				stats: {
					[Stat.FarmingFortune]: 3,
					[Stat.Speed]: 5,
				},
				cost: 20_000,
			},
			[Rarity.Epic]: {
				stats: {
					[Stat.FarmingFortune]: 4,
					[Stat.Speed]: 5,
				},
				cost: 50_000,
			},
			[Rarity.Legendary]: {
				stats: {
					[Stat.FarmingFortune]: 5,
					[Stat.Speed]: 6,
				},
				cost: 100_000,
			},
			[Rarity.Mythic]: {
				stats: {
					[Stat.FarmingFortune]: 6,
					[Stat.Speed]: 6,
				},
				cost: 200_000,
			},
		},
	},
	rooted: {
		name: 'Rooted',
		wiki: 'https://wiki.hypixel.net/Burrowing_Spores',
		appliesTo: [ReforgeTarget.Equipment],
		stone: {
			name: 'Burrowing Spores',
			id: 'BURROWING_SPORES',
		},
		tiers: {
			[Rarity.Common]: {
				stats: {
					[Stat.FarmingFortune]: 6,
					[Stat.Health]: 2,
				},
				cost: 20_000,
			},
			[Rarity.Uncommon]: {
				stats: {
					[Stat.FarmingFortune]: 9,
					[Stat.Health]: 5,
				},
				cost: 40_000,
			},
			[Rarity.Rare]: {
				stats: {
					[Stat.FarmingFortune]: 12,
					[Stat.Health]: 8,
				},
				cost: 80_000,
			},
			[Rarity.Epic]: {
				stats: {
					[Stat.FarmingFortune]: 15,
					[Stat.Health]: 11,
				},
				cost: 150_000,
			},
			[Rarity.Legendary]: {
				stats: {
					[Stat.FarmingFortune]: 18,
					[Stat.Health]: 14,
				},
				cost: 300_000,
			},
			[Rarity.Mythic]: {
				stats: {
					[Stat.FarmingFortune]: 21,
					[Stat.Health]: 17,
				},
				cost: 600_000,
			},
		},
	},
};

export const STAT_ICONS: Record<Stat, string> = {
	[Stat.Strength]: '❁',
	[Stat.Health]: '❤',
	[Stat.Defense]: '❈',
	[Stat.Speed]: '✦',
	[Stat.Intelligence]: '✎',
	[Stat.CritChance]: '☣',
	[Stat.CritDamage]: '☣',
	[Stat.AttackSpeed]: '⚔',
	[Stat.AbilityDamage]: '๑',
	[Stat.MagicFind]: '✯',
	[Stat.PetLuck]: '♣',
	[Stat.TrueDefense]: '❂',
	[Stat.SeaCreatureChance]: 'α',
	[Stat.Ferocity]: '⫽',
	[Stat.MiningSpeed]: '⸕',
	[Stat.MiningFortune]: '☘',
	[Stat.FarmingFortune]: '☘',
	[Stat.ForagingFortune]: '☘',
	[Stat.MiningWisdom]: '☯',
	[Stat.FarmingWisdom]: '☯',
	[Stat.ForagingWisdom]: '☯',
	[Stat.Pristine]: '✧',
	[Stat.BonusPestChance]: 'ൠ',
};

export const RARITY_COLORS: Record<Rarity, string> = {
	[Rarity.Common]: '§f',
	[Rarity.Uncommon]: '§a',
	[Rarity.Rare]: '§9',
	[Rarity.Epic]: '§5',
	[Rarity.Legendary]: '§6',
	[Rarity.Mythic]: '§d',
	[Rarity.Divine]: '§b',
	[Rarity.Special]: '§c',
	[Rarity.VerySpecial]: '§c',
	[Rarity.Ultimate]: '§4',
	[Rarity.Admin]: '§4',
};
