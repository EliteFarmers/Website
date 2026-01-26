import { FarmingPetStatType, FarmingPets } from '../constants/pets.js';
import { Rarity } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import { unlockedPestBestiaryTiers } from '../util/pests.js';
import { BeePet } from './pets/bee.js';
import { ChickenPet } from './pets/chicken.js';
import { ElephantPet } from './pets/elephant.js';
import { HedgehogPet } from './pets/hedgehog.js';
import { MooshroomCowPet } from './pets/mooshroom-cow.js';
import { MosquitoPet } from './pets/mosquito.js';
import { PigPet } from './pets/pig.js';
import { RabbitPet } from './pets/rabbit.js';
import { RoseDragonPet } from './pets/rose-dragon.js';
import { SlugPet } from './pets/slug.js';
import type { FarmingPetAbility, FarmingPetInfo, FarmingPetItemInfo, FarmingPetType } from './types/pets.js';

export { FarmingPets, FarmingPetStatType };
export type { FarmingPetAbility, FarmingPetInfo, FarmingPetItemInfo, FarmingPetType };

export const FARMING_PETS: Record<FarmingPets, FarmingPetInfo> = {
	[FarmingPets.Elephant]: new ElephantPet(),
	[FarmingPets.MooshroomCow]: new MooshroomCowPet(),
	[FarmingPets.Bee]: new BeePet(),
	[FarmingPets.Rabbit]: new RabbitPet(),
	[FarmingPets.Slug]: new SlugPet(),
	[FarmingPets.Hedgehog]: new HedgehogPet(),
	[FarmingPets.Chicken]: new ChickenPet(),
	[FarmingPets.Mosquito]: new MosquitoPet(),
	[FarmingPets.RoseDragon]: new RoseDragonPet(),
	[FarmingPets.Pig]: new PigPet(),
};

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
