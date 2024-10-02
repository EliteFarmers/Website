import { PlayerOptions } from '../player/player';
import { Rarity, RarityRecord } from '../constants/reforges';
import { Stat, StatsRecord } from "../constants/stats";
import { Skill } from '../constants/skills';
import { unlockedPestBestiaryTiers } from '../util/pests';
import type { FarmingPet } from '../fortune/farmingpet';

export enum FarmingPets {
	Elephant = 'ELEPHANT',
	MooshroomCow = 'MOOSHROOM_COW',
	Bee = 'BEE',
	Rabbit = 'RABBIT',
	Slug = 'SLUG',
	TRex = 'TYRANNOSAURUS',
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

export interface FarmingPetAbility {
	name: string;
	exists?: (player: PlayerOptions, pet: FarmingPet) => boolean;
	computed: (player: PlayerOptions, pet: FarmingPet) => StatsRecord;
}

export interface FarmingPetInfo {
	name: string;
	wiki: string;
	maxLevel?: number;
	stats?: StatsRecord<FarmingPetStatType, FarmingPet>;
	perLevelStats?: StatsRecord<FarmingPetStatType, FarmingPet>;
	perRarityLevelStats?: RarityRecord<StatsRecord<FarmingPetStatType, FarmingPet>>;
	perStatStats?: StatsRecord<FarmingPetStatType>;
	abilities?: FarmingPetAbility[];
}

export const FARMING_PETS: Record<FarmingPets, FarmingPetInfo> = {
	[FarmingPets.Elephant]: {
		name: 'Elephant',
		wiki: 'https://wiki.hypixel.net/Elephant_Pet',
		perLevelStats: {
			[Stat.FarmingFortune]: {
				name: 'Farming Fortune',
				value: 1.5,
				type: FarmingPetStatType.Ability,
			},
		},
	},
	[FarmingPets.MooshroomCow]: {
		name: 'Mooshroom Cow',
		wiki: 'https://wiki.hypixel.net/Mooshroom_Cow_Pet',
		stats: {
			[Stat.FarmingFortune]: {
				name: 'Base Farming Fortune',
				calculated: (pet) => 10 + pet.level,
				type: FarmingPetStatType.Base,
			},
		},
		abilities: [
			{
				name: 'Farming Strength',
				exists: (player, pet) => pet.rarity === Rarity.Legendary,
				computed: (player, pet) => {
					const strengthPer = 40 - pet.level * 0.2;
					const strength = player.strength ?? 0;

					const amount = Math.floor((strength / strengthPer) * 0.7);
					return {
						[Stat.FarmingFortune]: {
							name: 'Farming Strength Fortune',
							value: amount,
							type: FarmingPetStatType.Ability,
						},
					};
				},
			},
		],
	},
	[FarmingPets.Bee]: {
		name: 'Bee',
		wiki: 'https://wiki.hypixel.net/Bee_Pet',
		perLevelStats: {
			[Stat.Strength]: {
				name: 'Bee Strength',
				value: 0.3,
				type: FarmingPetStatType.Base,
			},
		},
		perRarityLevelStats: {
			[Rarity.Rare]: {
				[Stat.FarmingFortune]: {
					name: 'Busy Buzz Buzz',
					value: 0.2,
					type: FarmingPetStatType.Base,
				},
			},
			[Rarity.Epic]: {
				[Stat.FarmingFortune]: {
					name: 'Busy Buzz Buzz',
					value: 0.3,
					type: FarmingPetStatType.Base,
				},
			},
			[Rarity.Legendary]: {
				[Stat.FarmingFortune]: {
					name: 'Busy Buzz Buzz',
					value: 0.3,
					type: FarmingPetStatType.Base,
				},
			},
		},
	},
	[FarmingPets.Rabbit]: {
		name: 'Rabbit',
		wiki: 'https://wiki.hypixel.net/Rabbit_Pet',
		perLevelStats: {
			[Stat.Speed]: {
				name: 'Rabbit Speed',
				value: 0.2,
				type: FarmingPetStatType.Base,
			},
			[Stat.Health]: {
				name: 'Rabbit Health',
				value: 1,
				type: FarmingPetStatType.Base,
			},
		},
		perRarityLevelStats: {
			[Rarity.Rare]: {
				[Stat.FarmingWisdom]: {
					name: 'Farming Wisdom Boost',
					value: 0.25,
					type: FarmingPetStatType.Ability,
				},
			},
			[Rarity.Epic]: {
				[Stat.FarmingWisdom]: {
					name: 'Farming Wisdom Boost',
					value: 0.3,
					type: FarmingPetStatType.Ability,
				},
			},
			[Rarity.Legendary]: {
				[Stat.FarmingWisdom]: {
					name: 'Farming Wisdom Boost',
					value: 0.3,
					type: FarmingPetStatType.Ability,
				},
			},
			[Rarity.Mythic]: {
				[Stat.FarmingWisdom]: {
					name: 'Farming Wisdom Boost',
					value: 0.3,
					type: FarmingPetStatType.Ability,
				},
			},
		}
	},
	[FarmingPets.Slug]: {
		name: 'Slug',
		wiki: 'https://wiki.hypixel.net/Slug_Pet',
		perLevelStats: {
			[Stat.Defense]: {
				name: 'Slug Defense',
				value: 0.2,
				type: FarmingPetStatType.Base,
			},
			[Stat.Intelligence]: {
				name: 'Slug Intelligence',
				value: 0.25,
				type: FarmingPetStatType.Base,
			},
		},
		perRarityLevelStats: {
			[Rarity.Epic]: {
				[Stat.BonusPestChance]: {
					name: 'Pest Friends',
					value: 0.4,
					type: FarmingPetStatType.Ability,
				},
			},
			[Rarity.Legendary]: {
				[Stat.BonusPestChance]: {
					name: 'Pest Friends',
					value: 0.4,
					type: FarmingPetStatType.Ability,
				},
			},
		},
		abilities: [
			{
				name: 'Repugnant Aroma',
				// No good option to check if player is in a sprayed plot yet
				exists: (player, pet) => pet.rarity === Rarity.Legendary && (player.temporaryFortune?.flourSpray ?? false),
				computed: (player, pet) => {
					return {
						[Stat.FarmingFortune]: {
							name: 'Repungent Aroma',
							value: pet.level,
							type: FarmingPetStatType.Ability,
						},
					};
				},
			}
		]
	},
	[FarmingPets.TRex]: {
		name: 'T-Rex',
		wiki: 'https://wiki.hypixel.net/T-Rex_Pet',
		perLevelStats: {
			[Stat.Strength]: {
				name: 'T-Rex Strength',
				value: 0.75,
				type: FarmingPetStatType.Base,
			},
			[Stat.CritChance]: {
				name: 'T-Rex Crit Chance',
				value: 0.05,
				type: FarmingPetStatType.Base,
			},
			[Stat.Ferocity]: {
				name: 'T-Rex Ferocity',
				value: 0.25,
				type: FarmingPetStatType.Base,
			},
		},
		abilities: [
			{
				name: 'Tyrant',
				computed: (player, pet) => {
					// Effectively doubles pet item stats by counting them twice
					return pet.item?.stats ?? {};
				},
			}
		]
	},
};

export interface FarmingPetItemInfo {
	name: string;
	wiki: string;
	stats?: StatsRecord<PlayerOptions>;
	skillReq?: Partial<Record<Skill, number>>;
}

export const FARMING_PET_ITEMS: Record<string, FarmingPetItemInfo> = {
	YELLOW_BANDANA: {
		name: 'Yellow Bandana',
		wiki: 'https://wiki.hypixel.net/Yellow_Bandana',
		stats: {
			[Stat.FarmingFortune]: {
				name: 'Bandana Fortune',
				value: 30,
			},
		},
	},
	GREEN_BANDANA: {
		name: 'Green Bandana',
		wiki: 'https://wiki.hypixel.net/Green_Bandana',
		stats: {
			[Stat.FarmingFortune]: {
				name: 'Bandana Fortune',
				calculated: (player) => 4 * (player.gardenLevel ?? 0),
			},
		},
	},
	BROWN_BANDANA: {
		name: 'Brown Bandana',
		wiki: 'https://wiki.hypixel.net/Brown_Bandana',
		stats: {
			[Stat.BonusPestChance]: {
				name: 'Bandana Pest Chance',
				calculated: (player) => 0.2 * unlockedPestBestiaryTiers(player.bestiaryKills ?? {}),
			}
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
} as Partial<Record<Rarity, number>>;

export const PET_LEVELS = [
	100, 110, 120, 130, 145, 160, 175, 190, 210, 230, 250, 275, 300, 330, 360, 400, 440, 490, 540, 600, 660, 730, 800,
	880, 960, 1050, 1150, 1260, 1380, 1510, 1650, 1800, 1960, 2130, 2310, 2500, 2700, 2920, 3160, 3420, 3700, 4000, 4350,
	4750, 5200, 5700, 6300, 7000, 7800, 8700, 9700, 10800, 12000, 13300, 14700, 16200, 17800, 19500, 21300, 23200, 25200,
	27400, 29800, 32400, 35200, 38200, 41400, 44800, 48400, 52200, 56200, 60400, 64800, 69400, 74200, 79200, 84700, 90700,
	97200, 104200, 111700, 119700, 128200, 137200, 146700, 156700, 167700, 179700, 192700, 206700, 221700, 237700, 254700,
	272700, 291700, 311700, 333700, 357700, 383700, 411700, 441700, 476700, 516700, 561700, 611700, 666700, 726700,
	791700, 861700, 936700, 1016700, 1101700, 1191700, 1286700, 1386700, 1496700, 1616700, 1746700, 1886700, 0, 5555,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
];
