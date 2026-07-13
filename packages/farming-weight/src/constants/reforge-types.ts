import type { Stat } from './stats.js';

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
};

export function compareRarity(a: Rarity | string, b: Rarity | string) {
	return RARITY_VALUES[a as Rarity] - RARITY_VALUES[b as Rarity];
}

export enum ReforgeTarget {
	FarmingTool = 'Farming Tool',
	Vacuum = 'Vacuum',
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
	id: string;
	name: string;
	wiki: string;
	stone?: {
		name: string;
		id: string;
		npc?: number;
		copper?: number;
	};
	appliesTo: ReforgeTarget[];
	tiers: Partial<ReforgeTiers>;
	/** If true, this reforge should be prioritized over others even if it provides less fortune */
	priority?: boolean;
}
