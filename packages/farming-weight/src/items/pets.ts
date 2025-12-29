import { Rarity, type RarityRecord } from '../constants/reforges.js';
import type { Skill } from '../constants/skills.js';
import { Stat, type StatsRecord } from '../constants/stats.js';
import type { FarmingPet } from '../fortune/farmingpet.js';
import type { FarmingPlayer } from '../player/player.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import { unlockedPestBestiaryTiers } from '../util/pests.js';

export enum FarmingPets {
	Elephant = 'ELEPHANT',
	MooshroomCow = 'MOOSHROOM_COW',
	Bee = 'BEE',
	Rabbit = 'RABBIT',
	Slug = 'SLUG',
	Hedgehog = 'HEDGEHOG',
	Chicken = 'CHICKEN',
	Pig = 'PIG',
	Mosquito = 'MOSQUITO',
	RoseDragon = 'ROSE_DRAGON',
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
	exists?: (player: { player?: FarmingPlayer, options: PlayerOptions} , pet: FarmingPet ) => boolean;
	computed: (player: { player?: FarmingPlayer, options: PlayerOptions}, pet: FarmingPet ) => StatsRecord;
}

export interface FarmingPetInfo {
	name: string;
	wiki: string;
	maxLevel?: number;
	maxRarity?: Rarity;
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
				exists: (_, pet) => pet.rarity === Rarity.Legendary,
				computed: (player, pet) => {
					const strengthPer = 40 - pet.level * 0.2;
					const strength = player.options.strength ?? 0;

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
		maxRarity: Rarity.Mythic,
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
		},
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
				exists: (player, pet) => pet.rarity === Rarity.Legendary && (player.options.sprayedPlot ?? false),
				computed: (_, pet) => {
					return {
						[Stat.FarmingFortune]: {
							name: 'Repungent Aroma',
							value: pet.level,
							type: FarmingPetStatType.Ability,
						},
					};
				},
			},
		],
	},
	[FarmingPets.Hedgehog]: {
		name: 'Hedgehog',
		wiki: 'https://wiki.hypixel.net/Hedgehog_Pet',
		perLevelStats: {
			[Stat.Speed]: {
				name: 'Speed',
				value: 0.15,
				type: FarmingPetStatType.Base,
			},
		},
		perRarityLevelStats: {
			[Rarity.Legendary]: {
				[Stat.PestKillFortune]: {
					name: 'Fearsome Farmer',
					value: 1,
					type: FarmingPetStatType.Ability,
				},
			},
		},
		abilities: [
			{
				name: 'Nocturnal',
				exists: () => true,
				computed: (_, pet) => {
					// Add option for time of day later
					return {
						[Stat.FarmingFortune]: {
							name: 'Nocturnal',
							value: pet.level * 0.45 * 3,
							type: FarmingPetStatType.Ability,
						},
					};
				},
			},
		],
	},
	[FarmingPets.Chicken]: {
		name: 'Chicken',
		wiki: 'https://wiki.hypixel.net/Chicken_Pet',
		perLevelStats: {
			[Stat.Speed]: {
				name: 'Speed',
				value: 0.5,
				type: FarmingPetStatType.Base,
			},
			[Stat.FarmingFortune]: {
				name: 'Farming Fortune',
				value: 0.5,
				type: FarmingPetStatType.Base,
			},
		},
	},
	[FarmingPets.Mosquito]: {
		name: 'Mosquito',
		wiki: 'https://wiki.hypixel.net/Mosquito_Pet',
		perLevelStats: {
			[Stat.Speed]: {
				name: 'Speed',
				value: 0.2,
				type: FarmingPetStatType.Base,
			},
			[Stat.BonusPestChance]: {
				name: 'Bonus Pest Chance',
				value: 0.5,
				type: FarmingPetStatType.Base,
			},
		},
		abilities: [
			{
				name: "Buzzin' Barterer",
				exists: (_, pet) => pet.rarity !== Rarity.Common && pet.rarity !== Rarity.Uncommon,
				computed: (player, pet) => {
					return {
						[Stat.SugarCaneFortune]: {
							name: "Buzzin' Barterer",
							value: pet.level * 0.02 * (player.options.uniqueVisitors ?? 0),
							type: FarmingPetStatType.Ability,
						},
					};
				},
			},
		],
	},
	[FarmingPets.RoseDragon]: {
		name: 'Rose Dragon',
		wiki: 'https://wiki.hypixel.net/Rose_Dragon_Pet',
		maxLevel: 200,
		stats: {
			[Stat.FarmingFortune]: {
				name: 'Base Stats',
				type: FarmingPetStatType.Base,
				calculated: (pet) => (pet.level < 101 ? 0 : (pet.level - 100) * 0.2) + 20,
			},
			[Stat.Speed]: {
				name: 'Base Stats',
				type: FarmingPetStatType.Base,
				calculated: (pet) => (pet.level < 101 ? 0 : (pet.level - 100) * 0.5) + 50,
			},
		},
		abilities: [
			{
				name: 'Garden Power',
				exists: (_, pet) => pet.level >= 101,
				computed: (player) => {
					return {
						[Stat.FarmingFortune]: {
							name: 'Garden Power',
							value: (player.options.farmingLevel ?? 0) * 3,
							type: FarmingPetStatType.Ability,
						},
					};
				},
			},
			{
				name: 'Rosy Scales',
				exists: (_, pet) => pet.level >= 101,
				computed: (player) => {
					const milestoneLevels = Object.values(player.options.milestones ?? {}).reduce((a, b) => a + b, 0);
					return {
						[Stat.FarmingFortune]: {
							name: 'Rosy Scales',
							value: milestoneLevels * 0.15,
							type: FarmingPetStatType.Ability,
						},
						[Stat.Speed]: {
							name: 'Rosy Scales',
							value: milestoneLevels * 0.1,
							type: FarmingPetStatType.Ability,
						},
					};
				},
			},
			{
				name: 'Symbiosis',
				exists: (_, pet) => pet.level >= 200,
				computed: ({ player }) => {
					const maxedPets: Record<string, number> = {};
					for (const pet of (player?.pets ?? player?.options?.pets ?? [])) {
						if (pet.type === FarmingPets.RoseDragon) {
							continue;
						}

						if ('level' in pet) {
							const info = FARMING_PETS[pet.type as FarmingPets];
							if (pet.level >= 100 && (info?.maxRarity ?? Rarity.Legendary) === pet.rarity) {
								maxedPets[pet.type] = 1;
							}
						}
					}
					const maxedPetCount = Object.values(maxedPets).length;

					return {
						[Stat.FarmingFortune]: {
							name: 'Symbiosis',
							value: maxedPetCount * 3,
							type: FarmingPetStatType.Ability,
						},
					};
				},
			},
		],
	},
	[FarmingPets.Pig]: {
		name: 'Pig',
		wiki: 'https://wiki.hypixel.net/Pig_Pet',
		perLevelStats: {
			[Stat.Speed]: {
				name: 'Speed',
				value: 0.25,
				type: FarmingPetStatType.Base,
			},
		},
		abilities: [
			{
				name: 'Trample',
				exists: (_, pet) => pet.rarity === Rarity.Legendary,
				computed: ({ player }) => {
					// Trample reduces fortune by 75%
					const fortune = (player?.fortune ?? 0) + (player?.tempFortune ?? 0);
					return {
						[Stat.FarmingFortune]: {
							name: 'Trample (75% Reduction)',
							value: -fortune * 0.75,
							type: FarmingPetStatType.Ability,
						},
					};
				},
			},
		],
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
} as Partial<Record<Rarity, number>>;

export const PET_LEVELS = [
	100, 110, 120, 130, 145, 160, 175, 190, 210, 230, 250, 275, 300, 330, 360, 400, 440, 490, 540, 600, 660, 730, 800,
	880, 960, 1050, 1150, 1260, 1380, 1510, 1650, 1800, 1960, 2130, 2310, 2500, 2700, 2920, 3160, 3420, 3700, 4000,
	4350, 4750, 5200, 5700, 6300, 7000, 7800, 8700, 9700, 10800, 12000, 13300, 14700, 16200, 17800, 19500, 21300, 23200,
	25200, 27400, 29800, 32400, 35200, 38200, 41400, 44800, 48400, 52200, 56200, 60400, 64800, 69400, 74200, 79200,
	84700, 90700, 97200, 104200, 111700, 119700, 128200, 137200, 146700, 156700, 167700, 179700, 192700, 206700, 221700,
	237700, 254700, 272700, 291700, 311700, 333700, 357700, 383700, 411700, 441700, 476700, 516700, 561700, 611700,
	666700, 726700, 791700, 861700, 936700, 1016700, 1101700, 1191700, 1286700, 1386700, 1496700, 1616700, 1746700,
	1886700, 0, 5555, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
	1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700,
];
