import { describe, expect, test } from 'vitest';
import { Rarity } from '../constants/reforges.js';
import { Stat, type StatValue } from '../constants/stats.js';
import { FARMING_PET_ITEMS, FARMING_PETS, FarmingPets, FarmingPetStatType } from '../items/pets.js';
import { FarmingPet } from './farmingpet.js';

function expectStatValue<T, C>(stat: StatValue<T, C> | undefined, value: number) {
	expect(stat && 'value' in stat).toBe(true);
	if (!stat || !('value' in stat)) {
		throw new Error('Expected stat to have a flat value');
	}

	expect(stat.value).toBe(value);
}

function expectCalculatedStat<T, C>(stat: StatValue<T, C> | undefined) {
	expect(stat && 'calculated' in stat).toBe(true);
	if (!stat || !('calculated' in stat)) {
		throw new Error('Expected stat to have a calculated value');
	}

	expect(stat.calculated).toBeDefined();
}

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
		expectStatValue(elephant.perLevelStats?.[Stat.FarmingFortune], 1.5);
		expect(elephant.perLevelStats?.[Stat.FarmingFortune]?.type).toBe(FarmingPetStatType.Ability);
	});

	test('Mooshroom Cow pet has correct base stats and abilities', () => {
		const mooshroom = FARMING_PETS[FarmingPets.MooshroomCow];
		expect(mooshroom.name).toBe('Mooshroom Cow');
		expect(mooshroom.stats?.[Stat.FarmingFortune]?.type).toBe(FarmingPetStatType.Base);
		expectCalculatedStat(mooshroom.stats?.[Stat.FarmingFortune]);
		expect(mooshroom.abilities).toHaveLength(1);
		expect(mooshroom.abilities?.[0].name).toBe('Farming Strength');
	});

	test('Bee pet has correct per-rarity stats', () => {
		const bee = FARMING_PETS[FarmingPets.Bee];
		expect(bee.name).toBe('Bee');
		expectStatValue(bee.perLevelStats?.[Stat.Strength], 0.3);
		expectStatValue(bee.perRarityLevelStats?.[Rarity.Rare]?.[Stat.FarmingFortune], 0.2);
		expectStatValue(bee.perRarityLevelStats?.[Rarity.Epic]?.[Stat.FarmingFortune], 0.3);
		expectStatValue(bee.perRarityLevelStats?.[Rarity.Legendary]?.[Stat.FarmingFortune], 0.3);
	});

	test('Rabbit pet has correct max rarity and per-rarity stats', () => {
		const rabbit = FARMING_PETS[FarmingPets.Rabbit];
		expect(rabbit.name).toBe('Rabbit');
		expect(rabbit.maxRarity).toBe(Rarity.Mythic);
		expectStatValue(rabbit.perLevelStats?.[Stat.Speed], 0.2);
		expectStatValue(rabbit.perLevelStats?.[Stat.Health], 1);
		expectStatValue(rabbit.perRarityLevelStats?.[Rarity.Mythic]?.[Stat.FarmingWisdom], 0.3);
	});

	test('Slug pet has correct per-level stats and abilities', () => {
		const slug = FARMING_PETS[FarmingPets.Slug];
		expect(slug.name).toBe('Slug');
		expectStatValue(slug.perLevelStats?.[Stat.Defense], 0.2);
		expectStatValue(slug.perLevelStats?.[Stat.Intelligence], 0.25);
		expectStatValue(slug.perRarityLevelStats?.[Rarity.Legendary]?.[Stat.BonusPestChance], 0.4);
		expect(slug.abilities).toHaveLength(1);
		expect(slug.abilities?.[0].name).toBe('Repugnant Aroma');
		expect(slug.abilities?.[0].temporary).toBe(true);
	});

	test('Hedgehog pet has correct abilities', () => {
		const hedgehog = FARMING_PETS[FarmingPets.Hedgehog];
		expect(hedgehog.name).toBe('Hedgehog');
		expectStatValue(hedgehog.perLevelStats?.[Stat.Speed], 0.15);
		expectStatValue(hedgehog.perRarityLevelStats?.[Rarity.Legendary]?.[Stat.PestKillFortune], 1);
		expect(hedgehog.abilities).toHaveLength(1);
		expect(hedgehog.abilities?.[0].name).toBe("Hunter's Insight");
	});

	test('Chicken pet has correct per-level stats', () => {
		const chicken = FARMING_PETS[FarmingPets.Chicken];
		expect(chicken.name).toBe('Chicken');
		expectStatValue(chicken.perLevelStats?.[Stat.Speed], 0.5);
		expectStatValue(chicken.perLevelStats?.[Stat.FarmingFortune], 0.5);
	});

	test('Pig pet has Shining Stampede ability', () => {
		const pig = FARMING_PETS[FarmingPets.Pig];
		expect(pig.name).toBe('Pig');
		expectStatValue(pig.perLevelStats?.[Stat.Speed], 0.25);
		expectStatValue(pig.perLevelStats?.[Stat.PotatoFortune], 0.2);
		expect(pig.abilities).toHaveLength(1);
		expect(pig.abilities?.[0].name).toBe('Shining Stampede');
	});

	test('Mosquito pet has correct stats and abilities', () => {
		const mosquito = FARMING_PETS[FarmingPets.Mosquito];
		expect(mosquito.name).toBe('Mosquito');
		expectStatValue(mosquito.perLevelStats?.[Stat.Speed], 0.2);
		expectStatValue(mosquito.perLevelStats?.[Stat.BonusPestChance], 0.5);
		expect(mosquito.abilities).toHaveLength(1);
		expect(mosquito.abilities?.[0].name).toBe("Buzzin' Barterer");
	});

	test('Rose Dragon pet has correct max level and abilities', () => {
		const roseDragon = FARMING_PETS[FarmingPets.RoseDragon];
		expect(roseDragon.name).toBe('Rose Dragon');
		expect(roseDragon.maxLevel).toBe(200);
		expectCalculatedStat(roseDragon.stats?.[Stat.FarmingFortune]);
		expectCalculatedStat(roseDragon.stats?.[Stat.Speed]);
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
		expectStatValue(FARMING_PET_ITEMS['YELLOW_BANDANA'].stats?.[Stat.FarmingFortune], 30);
	});

	test('Green Bandana has calculated stats', () => {
		expect(FARMING_PET_ITEMS['GREEN_BANDANA'].name).toBe('Green Bandana');
		expectCalculatedStat(FARMING_PET_ITEMS['GREEN_BANDANA'].stats?.[Stat.FarmingFortune]);
	});

	test('Brown Bandana has calculated pest chance stats', () => {
		expect(FARMING_PET_ITEMS['BROWN_BANDANA'].name).toBe('Brown Bandana');
		expectCalculatedStat(FARMING_PET_ITEMS['BROWN_BANDANA'].stats?.[Stat.BonusPestChance]);
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
		const pet = new FarmingPet(
			{
				type: 'MOSQUITO',
				exp: 30000000000,
				tier: 'LEGENDARY',
				heldItem: null,
			},
			{ uniqueVisitors: 84 }
		);
		expect(pet.level).toBe(100);
		// SugarCane Fortune: min(level * 0.02 * visitors, 175) = min(100 * 0.02 * 84, 175) = min(168, 175) = 168
		expect(pet.getFortune(Stat.SugarCaneFortune)).toBe(168);
	});

	test('Rose Dragon level 200 fortune', () => {
		const pet = new FarmingPet(
			{
				type: 'ROSE_DRAGON',
				exp: 210000000000, // Very high to ensure level 200
				tier: 'LEGENDARY',
				heldItem: null,
			},
			{
				farmingLevel: 60,
				milestones: {
					WHEAT: 46,
					CARROT_ITEM: 46,
					POTATO_ITEM: 46,
					MELON: 46,
					PUMPKIN: 46,
					CACTUS: 46,
					SUGAR_CANE: 46,
					"INK_SACK:3": 46,
					MUSHROOM_COLLECTION: 46,
					NETHER_STALK: 46,
				},
				pets: [],
			}
		);
		expect(pet.level).toBe(200);
		// Base Stats (level >= 101): 200 * 0.2 = 40
		// Garden Power (level >= 101): 60 * (3 * 200 / 200) = 60 * 3 = 180
		// Rosy Scales (level >= 101): 460 * (0.15 * 200 / 200) = 460 * 0.15 = 69
		// Symbiosis (level >= 200): 0 (no maxed pets in the options)
		// Total: 40 + 180 + 69 = 289
		expect(pet.fortune).toBe(289);
		expect(pet.getFortune(Stat.Overbloom)).toBe(40);
	});

	test('Hedgehog Hunter Insight fortune', () => {
		const pet = new FarmingPet(
			{
				type: 'HEDGEHOG',
				exp: 30000000000,
				tier: 'LEGENDARY',
				heldItem: null,
			},
			{
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
				},
			}
		);
		expect(pet.level).toBe(100);
		// 10 pests with all 15 tiers unlocked each = 150 tiers * 0.7 = 105 fortune
		expect(pet.fortune).toBe(105);
	});
});
