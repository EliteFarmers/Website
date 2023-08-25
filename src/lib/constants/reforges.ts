import { Rarity } from './rates';

export enum Stat {
	Strength = 'Strength',
	Health = 'Health',
	Defense = 'Defense',
	Speed = 'Speed',
	Intelligence = 'Intelligence',
	CritChance = 'Crit Chance',
	CritDamage = 'Crit Damage',
	AttackSpeed = 'Attack Speed',
	AbilityDamage = 'Ability Damage',
	MagicFind = 'Magic Find',
	PetLuck = 'Pet Luck',
	TrueDefense = 'True Defense',
	SeaCreatureChance = 'Sea Creature Chance',
	Ferocity = 'Ferocity',
	MiningSpeed = 'Mining Speed',
	MiningFortune = 'Mining Fortune',
	FarmingFortune = 'Farming Fortune',
	ForagingFortune = 'Foraging Fortune',
	MiningWisdom = 'Mining Wisdom',
	FarmingWisdom = 'Farming Wisdom',
	ForagingWisdom = 'Foraging Wisdom',
	Pristine = 'Pristine',
}

export enum ReforgeTarget {
	Hoe = 'Hoe',
	Axe = 'Axe',
	Armor = 'Armor',
	Equipment = 'Equipment',
}

export interface ReforgeTier {
	stats: Partial<Record<Stat, number>>;
	cost: number;
}

export type ReforgeTiers = Record<Rarity, ReforgeTier>;

export interface Reforge {
	name: string;
	wiki: string;
	appliesTo?: ReforgeTarget[];
	tiers: Partial<ReforgeTiers>;
}

export const REFORGES: Partial<Record<string, Reforge>> = {
	bountiful: {
		name: 'Bountiful',
		wiki: 'https://wiki.hypixel.net/Golden_Ball',
		appliesTo: [ReforgeTarget.Hoe, ReforgeTarget.Axe],
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
};
