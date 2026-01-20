import { describe, expect, test } from 'vitest';
import { Rarity } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import { FARMING_PET_ITEMS, FARMING_PETS, FarmingPets, FarmingPetStatType } from '../items/pets.js';
import { FarmingPet } from './farmingpet.js';

describe('Pet Definitions Integrity', () => {
	test('All farming pets are defined and have required fields', () => {
		const petIds = Object.values(FarmingPets);
		expect(petIds.length).toBe(10);

		for (const petId of petIds) {
			const info = FARMING_PETS[petId];
			expect(info, `Pet ${petId} should be defined`).toBeDefined();
			expect(info.name, `Pet ${petId} should have a name`).toBeDefined();
			expect(info.wiki, `Pet ${petId} should have a wiki link`).toBeDefined();
		}
	});

	test('Elephant pet has correct per-level stats', () => {
		const elephant = FARMING_PETS[FarmingPets.Elephant];
		expect(elephant.name).toBe('Elephant');
		expect(elephant.perLevelStats?.[Stat.FarmingFortune]?.value).toBe(1.5);
		expect(elephant.perLevelStats?.[Stat.FarmingFortune]?.type).toBe(FarmingPetStatType.Ability);
	});

	test('Mooshroom Cow pet has correct base stats and abilities', () => {
		const mooshroom = FARMING_PETS[FarmingPets.MooshroomCow];
		expect(mooshroom.name).toBe('Mooshroom Cow');
		expect(mooshroom.stats?.[Stat.FarmingFortune]?.type).toBe(FarmingPetStatType.Base);
		expect(mooshroom.stats?.[Stat.FarmingFortune]?.calculated).toBeDefined();
		expect(mooshroom.abilities).toHaveLength(1);
		expect(mooshroom.abilities?.[0].name).toBe('Farming Strength');
	});

	test('Bee pet has correct per-rarity stats', () => {
		const bee = FARMING_PETS[FarmingPets.Bee];
		expect(bee.name).toBe('Bee');
		expect(bee.perLevelStats?.[Stat.Strength]?.value).toBe(0.3);
		expect(bee.perRarityLevelStats?.[Rarity.Rare]?.[Stat.FarmingFortune]?.value).toBe(0.2);
		expect(bee.perRarityLevelStats?.[Rarity.Epic]?.[Stat.FarmingFortune]?.value).toBe(0.3);
		expect(bee.perRarityLevelStats?.[Rarity.Legendary]?.[Stat.FarmingFortune]?.value).toBe(0.3);
	});

	test('Rabbit pet has correct max rarity and per-rarity stats', () => {
		const rabbit = FARMING_PETS[FarmingPets.Rabbit];
		expect(rabbit.name).toBe('Rabbit');
		expect(rabbit.maxRarity).toBe(Rarity.Mythic);
		expect(rabbit.perLevelStats?.[Stat.Speed]?.value).toBe(0.2);
		expect(rabbit.perLevelStats?.[Stat.Health]?.value).toBe(1);
		expect(rabbit.perRarityLevelStats?.[Rarity.Mythic]?.[Stat.FarmingWisdom]?.value).toBe(0.3);
	});

	test('Slug pet has correct per-level stats and abilities', () => {
		const slug = FARMING_PETS[FarmingPets.Slug];
		expect(slug.name).toBe('Slug');
		expect(slug.perLevelStats?.[Stat.Defense]?.value).toBe(0.2);
		expect(slug.perLevelStats?.[Stat.Intelligence]?.value).toBe(0.25);
		expect(slug.perRarityLevelStats?.[Rarity.Legendary]?.[Stat.BonusPestChance]?.value).toBe(0.4);
		expect(slug.abilities).toHaveLength(1);
		expect(slug.abilities?.[0].name).toBe('Repugnant Aroma');
		expect(slug.abilities?.[0].temporary).toBe(true);
	});

	test('Hedgehog pet has correct abilities', () => {
		const hedgehog = FARMING_PETS[FarmingPets.Hedgehog];
		expect(hedgehog.name).toBe('Hedgehog');
		expect(hedgehog.perLevelStats?.[Stat.Speed]?.value).toBe(0.15);
		expect(hedgehog.perRarityLevelStats?.[Rarity.Legendary]?.[Stat.PestKillFortune]?.value).toBe(1);
		expect(hedgehog.abilities).toHaveLength(1);
		expect(hedgehog.abilities?.[0].name).toBe("Hunter's Insight");
	});

	test('Chicken pet has correct per-level stats', () => {
		const chicken = FARMING_PETS[FarmingPets.Chicken];
		expect(chicken.name).toBe('Chicken');
		expect(chicken.perLevelStats?.[Stat.Speed]?.value).toBe(0.5);
		expect(chicken.perLevelStats?.[Stat.FarmingFortune]?.value).toBe(0.5);
	});

	test('Pig pet has Trample ability', () => {
		const pig = FARMING_PETS[FarmingPets.Pig];
		expect(pig.name).toBe('Pig');
		expect(pig.perLevelStats?.[Stat.Speed]?.value).toBe(0.25);
		expect(pig.abilities).toHaveLength(1);
		expect(pig.abilities?.[0].name).toBe('Trample');
	});

	test('Mosquito pet has correct stats and abilities', () => {
		const mosquito = FARMING_PETS[FarmingPets.Mosquito];
		expect(mosquito.name).toBe('Mosquito');
		expect(mosquito.perLevelStats?.[Stat.Speed]?.value).toBe(0.2);
		expect(mosquito.perLevelStats?.[Stat.BonusPestChance]?.value).toBe(0.5);
		expect(mosquito.abilities).toHaveLength(1);
		expect(mosquito.abilities?.[0].name).toBe("Buzzin' Barterer");
	});

	test('Rose Dragon pet has correct max level and abilities', () => {
		const roseDragon = FARMING_PETS[FarmingPets.RoseDragon];
		expect(roseDragon.name).toBe('Rose Dragon');
		expect(roseDragon.maxLevel).toBe(200);
		expect(roseDragon.stats?.[Stat.FarmingFortune]?.calculated).toBeDefined();
		expect(roseDragon.stats?.[Stat.Speed]?.calculated).toBeDefined();
		expect(roseDragon.abilities).toHaveLength(4);
		expect(roseDragon.abilities?.map((a) => a.name)).toEqual([
			'Garden Power',
			'Rosy Scales',
			"Dragon's Gluttony",
			'Symbiosis',
		]);
	});
});

describe('Pet Items Integrity', () => {
	test('Yellow Bandana has correct stats', () => {
		expect(FARMING_PET_ITEMS['YELLOW_BANDANA'].name).toBe('Yellow Bandana');
		expect(FARMING_PET_ITEMS['YELLOW_BANDANA'].stats?.[Stat.FarmingFortune]?.value).toBe(30);
	});

	test('Green Bandana has calculated stats', () => {
		expect(FARMING_PET_ITEMS['GREEN_BANDANA'].name).toBe('Green Bandana');
		expect(FARMING_PET_ITEMS['GREEN_BANDANA'].stats?.[Stat.FarmingFortune]?.calculated).toBeDefined();
	});

	test('Brown Bandana has calculated pest chance stats', () => {
		expect(FARMING_PET_ITEMS['BROWN_BANDANA'].name).toBe('Brown Bandana');
		expect(FARMING_PET_ITEMS['BROWN_BANDANA'].stats?.[Stat.BonusPestChance]?.calculated).toBeDefined();
	});
});

describe('Pet Fortune Calculations', () => {
	test('Bee pet fortune at Legendary level 100', () => {
		const pet = new FarmingPet({
			type: 'BEE',
			exp: 30000000000,
			tier: 'LEGENDARY',
			heldItem: null,
		});
		expect(pet.level).toBe(100);
		// Legendary Bee: 0.3 * 100 = 30 Farming Fortune
		expect(pet.fortune).toBe(30);
	});

	test('Chicken pet fortune at Legendary level 100', () => {
		const pet = new FarmingPet({
			type: 'CHICKEN',
			exp: 30000000000,
			tier: 'LEGENDARY',
			heldItem: null,
		});
		expect(pet.level).toBe(100);
		// Chicken: 0.5 * 100 = 50 Farming Fortune
		expect(pet.fortune).toBe(50);
	});

	test('Rabbit pet fortune at Mythic level 100', () => {
		const pet = new FarmingPet({
			type: 'RABBIT',
			exp: 30000000000,
			tier: 'MYTHIC',
			heldItem: null,
		});
		expect(pet.level).toBe(100);
		// Rabbit has no Farming Fortune, only Farming Wisdom
		expect(pet.fortune).toBe(0);
	});

	test('Mosquito pet gives SugarCane fortune', () => {
		const pet = new FarmingPet({
			type: 'MOSQUITO',
			exp: 30000000000,
			tier: 'LEGENDARY',
			heldItem: null,
		}, { uniqueVisitors: 84 });
		expect(pet.level).toBe(100);
		// SugarCane Fortune: min(level * 0.02 * visitors, 175) = min(100 * 0.02 * 84, 175) = min(168, 175) = 168
		expect(pet.getFortune(Stat.SugarCaneFortune)).toBe(168);
	});

	test('Rose Dragon level 200 fortune', () => {
		const pet = new FarmingPet({
			type: 'ROSE_DRAGON',
			exp: 210000000000, // Very high to ensure level 200
			tier: 'LEGENDARY',
			heldItem: null,
		}, { 
			farmingLevel: 60,
			milestones: { WHEAT: 46, CARROT: 46, POTATO: 46, MELON: 46, PUMPKIN: 46, CACTUS: 46, SUGAR_CANE: 46, COCOA_BEANS: 46, MUSHROOM: 46, NETHER_WART: 46 },
			pets: [],
		});
		expect(pet.level).toBe(200);
		// Base Stats (level >= 101): 200 * 0.2 = 40
		// Garden Power (level >= 101): 60 * (3 * 200 / 200) = 60 * 3 = 180
		// Rosy Scales (level >= 101): 460 * (0.15 * 200 / 200) = 460 * 0.15 = 69
		// Symbiosis (level >= 200): 0 (no maxed pets in the options)
		// Total: 40 + 180 + 69 = 289
		expect(pet.fortune).toBe(289);
	});

	test('Hedgehog Hunter Insight fortune', () => {
		const pet = new FarmingPet({
			type: 'HEDGEHOG',
			exp: 30000000000,
			tier: 'LEGENDARY',
			heldItem: null,
		}, {
			bestiaryKills: {
				pest_mite_1: 50000,
				pest_cricket_1: 50000,
				pest_moth_1: 50000,
				pest_worm_1: 50000,
				pest_slug_1: 50000,
				pest_beetle_1: 50000,
				pest_locust_1: 50000,
				pest_rat_1: 50000,
				pest_mosquito_1: 50000,
				pest_fly_1: 50000,
			}
		});
		expect(pet.level).toBe(100);
		// 10 pests with all 15 tiers unlocked each = 150 tiers * 0.7 = 105 fortune
		expect(pet.fortune).toBe(105);
	});
});
