import { Rarity, Stat } from './reforges';
import { Skill } from './skills';

export enum FarmingPets {
	Elephant = 'ELEPHANT',
	MooshroomCow = 'MOOSHROOM_COW',
}

export interface FarmingPetType {
	uuid?: string | null;
	type?: string;
	exp?: number;
	active?: boolean;
	tier?: string | Rarity | null;
	heldItem?: string | null;
	candyUsed?: number;
	skin?: string | null;
}

export enum FarmingPetStatType {
	Base = 'base',
	Ability = 'ability',
}

export interface FarmingPetInfo {
	name: string;
	wiki: string;
	stats?: Partial<Record<Stat, number>>;
	perLevelStats?: Partial<
		Record<
			Stat,
			{
				name: string;
				multiplier: number;
				type?: FarmingPetStatType;
			}
		>
	>;
	perStatStats?: Partial<
		Record<
			Stat,
			{
				name: string;
				multiplier: number;
				type?: FarmingPetStatType;
			}
		>
	>;
}

export const FARMING_PETS: Record<FarmingPets, FarmingPetInfo> = {
	ELEPHANT: {
		name: 'Elephant',
		wiki: 'https://wiki.hypixel.net/Elephant_Pet',
		perLevelStats: {
			[Stat.FarmingFortune]: {
				name: 'Farming Fortune',
				multiplier: 1.5,
				type: FarmingPetStatType.Ability,
			},
		},
	},
	MOOSHROOM_COW: {
		name: 'Mooshroom Cow',
		wiki: 'https://wiki.hypixel.net/Mooshroom_Cow_Pet',
		stats: {
			[Stat.FarmingFortune]: 10,
		},
		perLevelStats: {
			[Stat.FarmingFortune]: {
				name: 'Farming Fortune',
				multiplier: 1,
				type: FarmingPetStatType.Base,
			},
		},
	},
};

export interface FarmingPetItemInfo {
	name: string;
	wiki: string;
	stats?: Partial<Record<Stat, number>>;
	perLevelStats?: {
		skill: Skill;
		stats: Partial<Record<Stat, number>>;
	};
	skillReq?: Partial<Record<Skill, number>>;
}

export const FARMING_PET_ITEMS: Record<string, FarmingPetItemInfo> = {
	YELLOW_BANDANA: {
		name: 'Yellow Bandana',
		wiki: 'https://wiki.hypixel.net/Yellow_Bandana',
		stats: {
			[Stat.FarmingFortune]: 30,
		},
	},
	GREEN_BANDANA: {
		name: 'Green Bandana',
		wiki: 'https://wiki.hypixel.net/Green_Bandana',
		perLevelStats: {
			skill: Skill.Garden,
			stats: {
				[Stat.FarmingFortune]: 4,
			},
		},
	},
};

export const PET_RARITY_OFFSETS = {
	[Rarity.Common]: 0,
	[Rarity.Uncommon]: 6,
	[Rarity.Rare]: 11,
	[Rarity.Epic]: 16,
	[Rarity.Legendary]: 20,
	[Rarity.Mythic]: 20,
};

export const PET_LEVELS = [
	100, 110, 120, 130, 145, 160, 175, 190, 210, 230, 250, 275, 300, 330, 360, 400, 440, 490, 540, 600, 660, 730, 800,
	880, 960, 1050, 1150, 1260, 1380, 1510, 1650, 1800, 1960, 2130, 2310, 2500, 2700, 2920, 3160, 3420, 3700, 4000,
	4350, 4750, 5200, 5700, 6300, 7000, 7800, 8700, 9700, 10800, 12000, 13300, 14700, 16200, 17800, 19500, 21300, 23200,
	25200, 27400, 29800, 32400, 35200, 38200, 41400, 44800, 48400, 52200, 56200, 60400, 64800, 69400, 74200, 79200,
	84700, 90700, 97200, 104200, 111700, 119700, 128200, 137200, 146700, 156700, 167700, 179700, 192700, 206700, 221700,
	237700, 254700, 272700, 291700, 311700, 333700, 357700, 383700, 411700, 441700, 476700, 516700, 561700, 611700,
	666700, 726700, 791700, 861700, 936700, 1016700, 1101700, 1191700, 1286700, 1386700, 1496700, 1616700, 1746700,
	1886700,
];
