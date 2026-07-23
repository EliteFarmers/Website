import { describe, expect, test } from 'vitest';
import { Rarity } from '../constants/reforges.js';
import { Stat, type StatValue } from '../constants/stats.js';
import { FARMING_PET_ITEMS, FARMING_PETS, FarmingPetStatType, FarmingPets } from '../items/pets.js';
import { FarmingPet } from './farmingpet.js';

function getPetInfo(id: FarmingPets): NonNullable<(typeof FARMING_PETS)[FarmingPets]> {
	const info = FARMING_PETS[id];
	expect(info, `Pet ${id} should be defined`).toBeDefined();
	return info!;
}

function getPetItemInfo(id: string): NonNullable<(typeof FARMING_PET_ITEMS)[string]> {
	const info = FARMING_PET_ITEMS[id];
	expect(info, `Pet item ${id} should be defined`).toBeDefined();
	return info!;
}

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

const MAX_LEVEL_EXP = 30000000000;

describe('Pet Definitions Integrity', () => {
	test('All farming pets are defined and have required fields', () => {
		const petIds = Object.values(FarmingPets);
		expect(petIds.length).toBe(11);

		for (const petId of petIds) {
			const info = getPetInfo(petId);
			expect(info.name, `Pet ${petId} should have a name`).toBeDefined();
			expect(info.wiki, `Pet ${petId} should have a wiki link`).toBeDefined();
		}
	});

	test('Elephant pet has correct per-level stats', () => {
		const elephant = getPetInfo(FarmingPets.Elephant);
		expect(elephant.name).toBe('Elephant');
		expectStatValue(elephant.perRarityLevelStats?.[Rarity.Mythic]?.[Stat.FarmingFortune], 0.5);
		expect(elephant.perRarityLevelStats?.[Rarity.Mythic]?.[Stat.FarmingFortune]?.type).toBe(
			FarmingPetStatType.Base
		);
		expectStatValue(elephant.perLevelStats?.[Stat.FarmingFortune], 1.5);
		expect(elephant.perLevelStats?.[Stat.FarmingFortune]?.type).toBe(FarmingPetStatType.Ability);
		expect(elephant.abilities?.[0]?.name).toBe('Abundant Harvest');
	});

	test('Mooshroom Cow pet has correct base stats and abilities', () => {
		const mooshroom = getPetInfo(FarmingPets.MooshroomCow);
		const ability = mooshroom.abilities?.[0];
		expect(mooshroom.name).toBe('Mooshroom Cow');
		expectStatValue(mooshroom.perLevelStats?.[Stat.FarmingFortune], 1);
		expect(mooshroom.perLevelStats?.[Stat.FarmingFortune]?.type).toBe(FarmingPetStatType.Base);
		expect(mooshroom.abilities).toHaveLength(2);
		expect(ability?.name).toBe('Farming Strength');
		expect(mooshroom.abilities?.[1]?.name).toBe('Bovine Blessing');
	});

	test('Orchid Mantis has base stats and level-scaled abilities', () => {
		const mantis = getPetInfo(FarmingPets.OrchidMantis);
		expect(mantis.name).toBe('Orchid Mantis');
		expect(mantis.maxRarity).toBe(Rarity.Legendary);
		expectStatValue(mantis.perLevelStats?.[Stat.Speed], 0.3);
		expectStatValue(mantis.perLevelStats?.[Stat.Overbloom], 0.15);
		expect(mantis.abilities?.map((ability) => ability.name)).toEqual(['Swift Sickles', 'Orchid Nectar']);
	});

	test('Bee pet has correct per-rarity stats', () => {
		const bee = getPetInfo(FarmingPets.Bee);
		expect(bee.name).toBe('Bee');
		expectStatValue(bee.perLevelStats?.[Stat.Strength], 0.3);
		expectStatValue(bee.perRarityLevelStats?.[Rarity.Rare]?.[Stat.FarmingFortune], 0.2);
		expectStatValue(bee.perRarityLevelStats?.[Rarity.Epic]?.[Stat.FarmingFortune], 0.3);
		expectStatValue(bee.perRarityLevelStats?.[Rarity.Legendary]?.[Stat.FarmingFortune], 0.3);
	});

	test('Rabbit pet has correct max rarity and per-rarity stats', () => {
		const rabbit = getPetInfo(FarmingPets.Rabbit);
		expect(rabbit.name).toBe('Rabbit');
		expect(rabbit.maxRarity).toBe(Rarity.Mythic);
		expectStatValue(rabbit.perLevelStats?.[Stat.Speed], 0.2);
		expectStatValue(rabbit.perLevelStats?.[Stat.Health], 1);
		expectStatValue(rabbit.perRarityLevelStats?.[Rarity.Mythic]?.[Stat.FarmingWisdom], 0.3);
	});

	test('Slug pet has correct per-level stats and abilities', () => {
		const slug = getPetInfo(FarmingPets.Slug);
		const ability = slug.abilities?.[0];
		expect(slug.name).toBe('Slug');
		expectStatValue(slug.perLevelStats?.[Stat.Defense], 0.2);
		expectStatValue(slug.perLevelStats?.[Stat.Intelligence], 0.25);
		expectStatValue(slug.perRarityLevelStats?.[Rarity.Legendary]?.[Stat.BonusPestChance], 0.4);
		expect(slug.abilities).toHaveLength(1);
		expect(ability?.name).toBe('Repugnant Aroma');
		expect(ability?.temporary).toBe(true);
	});

	test('Hedgehog pet has correct abilities', () => {
		const hedgehog = getPetInfo(FarmingPets.Hedgehog);
		const ability = hedgehog.abilities?.[0];
		expect(hedgehog.name).toBe('Hedgehog');
		expectStatValue(hedgehog.perLevelStats?.[Stat.Speed], 0.15);
		expectStatValue(hedgehog.perRarityLevelStats?.[Rarity.Legendary]?.[Stat.PestKillFortune], 1);
		expectStatValue(hedgehog.perRarityLevelStats?.[Rarity.Legendary]?.[Stat.Overbloom], 0.35);
		expect(hedgehog.abilities).toHaveLength(1);
		expect(ability?.name).toBe("Hunter's Insight");
	});

	test('Chicken pet has correct per-level stats', () => {
		const chicken = getPetInfo(FarmingPets.Chicken);
		expect(chicken.name).toBe('Chicken');
		expectStatValue(chicken.perLevelStats?.[Stat.Speed], 0.5);
		expectStatValue(chicken.perLevelStats?.[Stat.FarmingFortune], 0.5);
	});

	test('Pig pet has Shining Stampede ability', () => {
		const pig = getPetInfo(FarmingPets.Pig);
		const ability = pig.abilities?.[0];
		expect(pig.name).toBe('Pig');
		expectStatValue(pig.perLevelStats?.[Stat.Speed], 0.25);
		expectStatValue(pig.perLevelStats?.[Stat.PotatoFortune], 0.2);
		expect(pig.abilities).toHaveLength(1);
		expect(ability?.name).toBe('Shining Stampede');
	});

	test('Mosquito pet has correct stats and abilities', () => {
		const mosquito = getPetInfo(FarmingPets.Mosquito);
		const ability = mosquito.abilities?.[0];
		expect(mosquito.name).toBe('Mosquito');
		expectStatValue(mosquito.perLevelStats?.[Stat.Speed], 0.2);
		expectStatValue(mosquito.perLevelStats?.[Stat.BonusPestChance], 0.5);
		expect(mosquito.abilities).toHaveLength(1);
		expect(ability?.name).toBe("Buzzin' Barterer");
	});

	test('Rose Dragon pet has correct max level and abilities', () => {
		const roseDragon = getPetInfo(FarmingPets.RoseDragon);
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
		const item = getPetItemInfo('YELLOW_BANDANA');
		expect(item.name).toBe('Yellow Bandana');
		expectStatValue(item.stats?.[Stat.FarmingFortune], 30);
	});

	test('Green Bandana has calculated stats', () => {
		const item = getPetItemInfo('GREEN_BANDANA');
		expect(item.name).toBe('Green Bandana');
		expectCalculatedStat(item.stats?.[Stat.FarmingFortune]);
	});

	test('Brown Bandana has calculated pest chance stats', () => {
		const item = getPetItemInfo('BROWN_BANDANA');
		expect(item.name).toBe('Brown Bandana');
		expectCalculatedStat(item.stats?.[Stat.BonusPestChance]);
	});

	test('Lucky Clover pet items grant their updated Overbloom', () => {
		expectStatValue(getPetItemInfo('PET_ITEM_LUCKY_CLOVER').stats?.[Stat.Overbloom], 7);
		expectStatValue(getPetItemInfo('POIGNANT_LUCKY_CLOVER').stats?.[Stat.Overbloom], 13);
	});

	test('pet stat relics have explicit stat modifiers', () => {
		const minos = getPetItemInfo('MINOS_RELIC');
		const hephaestus = getPetItemInfo('HEPHAESTUS_RELIC');
		expect(minos.name).toBe('Minos Relic');
		expect(minos.modifiers).toContainEqual({
			kind: 'multiply-pet-stats',
			statTypes: [FarmingPetStatType.Base],
			multiplier: 4 / 3,
		});
		expect(hephaestus.name).toBe('Hephaestus Relic');
		expect(hephaestus.modifiers).toContainEqual({
			kind: 'multiply-pet-stats',
			statTypes: [FarmingPetStatType.Base],
			multiplier: 1.5,
		});
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
					'INK_SACK:3': 46,
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
		expect(pet.getFortune(Stat.Overbloom)).toBe(35);
	});
});

describe('Pet Item Modifier Calculations', () => {
	test('Hephaestus Relic boosts base pet stats and keeps the bonus in its own breakdown line', () => {
		const pet = new FarmingPet({
			type: 'BEE',
			exp: MAX_LEVEL_EXP,
			tier: 'LEGENDARY',
			heldItem: 'HEPHAESTUS_RELIC',
		});

		expect(pet.level).toBe(100);
		expect(pet.fortune).toBe(45);
		expect(pet.breakdown).toStrictEqual({
			'Busy Buzz Buzz': 30,
			'Hephaestus Relic': 15,
		});
	});

	test('Minos Relic boosts base Bonus Pest Chance on Mosquito', () => {
		const pet = new FarmingPet({
			type: 'MOSQUITO',
			exp: MAX_LEVEL_EXP,
			tier: 'LEGENDARY',
			heldItem: 'MINOS_RELIC',
		});

		const fullBreakdown = pet.getFullBreakdown();
		expect(pet.level).toBe(100);
		expect(pet.getFortune(Stat.BonusPestChance)).toBeCloseTo(50 * (4 / 3), 8);
		expect(fullBreakdown['Bonus Pest Chance']).toStrictEqual({ value: 50, stat: Stat.BonusPestChance });
		expect(fullBreakdown['Minos Relic']?.value).toBeCloseTo(50 / 3, 8);
		expect(fullBreakdown['Minos Relic']?.stat).toBe(Stat.BonusPestChance);
	});

	test('pet stat relics do not boost ability-typed Farming Fortune', () => {
		const pet = new FarmingPet({
			type: 'ELEPHANT',
			exp: MAX_LEVEL_EXP,
			tier: 'LEGENDARY',
			heldItem: 'HEPHAESTUS_RELIC',
		});
		const noItemPet = new FarmingPet({
			type: 'ELEPHANT',
			exp: MAX_LEVEL_EXP,
			tier: 'LEGENDARY',
			heldItem: null,
		});

		expect(pet.level).toBe(100);
		expect(pet.fortune).toBe(150);
		expect(pet.breakdown).toStrictEqual({
			'Farming Fortune': 150,
		});
		expect(noItemPet.getUpgrades({ stat: Stat.FarmingFortune }).map((upgrade) => upgrade.title)).not.toContain(
			'Hephaestus Relic'
		);
		expect(noItemPet.getUpgrades({ stat: Stat.FarmingFortune }).map((upgrade) => upgrade.title)).not.toContain(
			'Minos Relic'
		);
	});

	test('pet stat relics do not boost ability-typed pest stats while still boosting base stat types', () => {
		const pet = new FarmingPet(
			{
				type: 'SLUG',
				exp: MAX_LEVEL_EXP,
				tier: 'LEGENDARY',
				heldItem: 'HEPHAESTUS_RELIC',
			},
			{ sprayedPlot: true }
		);
		const noItemPet = new FarmingPet(
			{
				type: 'SLUG',
				exp: MAX_LEVEL_EXP,
				tier: 'LEGENDARY',
				heldItem: null,
			},
			{ sprayedPlot: true }
		);

		expect(pet.getFortune(Stat.BonusPestChance)).toBe(40);
		expect(pet.getFortune(Stat.FarmingFortune)).toBe(100);
		expect(pet.getFortune(Stat.Defense)).toBe(30);
		expect(
			noItemPet
				.getUpgrades({ stats: [Stat.BonusPestChance, Stat.FarmingFortune] })
				.map((upgrade) => upgrade.title)
		).not.toContain('Hephaestus Relic');
		expect(
			noItemPet
				.getUpgrades({ stats: [Stat.BonusPestChance, Stat.FarmingFortune] })
				.map((upgrade) => upgrade.title)
		).not.toContain('Minos Relic');
	});

	test('pet stat relic upgrades are offered when the requested stat is a base pet stat', () => {
		const pet = new FarmingPet({
			type: 'BEE',
			exp: MAX_LEVEL_EXP,
			tier: 'LEGENDARY',
			heldItem: null,
		});

		const upgrades = pet.getUpgrades({ stat: Stat.FarmingFortune });
		const hephaestus = upgrades.find((upgrade) => upgrade.title === 'Hephaestus Relic');
		const minos = upgrades.find((upgrade) => upgrade.title === 'Minos Relic');

		expect(hephaestus?.stats?.[Stat.FarmingFortune]).toBe(15);
		expect(minos?.stats?.[Stat.FarmingFortune]).toBeCloseTo(10, 8);
	});
});
