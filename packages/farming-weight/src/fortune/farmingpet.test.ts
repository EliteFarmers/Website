import { expect, test } from 'vitest';
import { Stat } from '../constants/stats.js';
import { FarmingPlayer } from '../player/player.js';
import { FarmingPet } from './farmingpet.js';

test('Elephant fortune test', () => {
	const elephant = {
		uuid: '02a3f604-4c42-4587-9407-13fd833a8225',
		type: 'ELEPHANT',
		exp: 138284372.34859112,
		active: false,
		tier: 'LEGENDARY',
		heldItem: 'YELLOW_BANDANA',
		candyUsed: 6,
		skin: null,
	};

	const pet = new FarmingPet(elephant);
	expect(pet.fortune).toBe(180);

	expect(pet.breakdown).toStrictEqual({
		'Farming Fortune': 150,
		'Yellow Bandana': 30,
	});

	const petWithLevel = new FarmingPet({ ...elephant, heldItem: 'GREEN_BANDANA' }, { gardenLevel: 15 });
	expect(petWithLevel.fortune).toBe(210);

	expect(petWithLevel.breakdown).toStrictEqual({
		'Farming Fortune': 150,
		'Green Bandana': 60,
	});
});

test('Mooshroom Cow fortune test', () => {
	const mooshroom = {
		uuid: 'ec3f021c-d92d-4b56-95fe-0a18653d2238',
		type: 'MOOSHROOM_COW',
		exp: 3721685427.3042827,
		active: false,
		tier: 'LEGENDARY',
		heldItem: 'GREEN_BANDANA',
		candyUsed: 0,
		skin: 'MOOSHROOM_COW_MOOCELIUM',
	};

	const pet = new FarmingPet(mooshroom);
	expect(pet.fortune).toBe(110);

	expect(pet.breakdown).toStrictEqual({
		'Base Farming Fortune': 110,
	});

	const petWithLevel = new FarmingPet(mooshroom, { gardenLevel: 15 });
	expect(petWithLevel.fortune).toBe(170);

	expect(petWithLevel.breakdown).toStrictEqual({
		'Base Farming Fortune': 110,
		'Green Bandana': 60,
	});

	const petWithStrength = new FarmingPet(mooshroom, { gardenLevel: 15, strength: 1500 });
	expect(petWithStrength.fortune).toBe(222);

	expect(petWithStrength.breakdown).toStrictEqual({
		'Base Farming Fortune': 110,
		'Green Bandana': 60,
		'Farming Strength Fortune': 52,
	});
});

test('Slug Repugnant Aroma with Hypercharge chip', () => {
	const slug = {
		uuid: 'test-slug-uuid',
		type: 'SLUG',
		exp: 30000000000, // Very high exp to ensure level 100
		active: false,
		tier: 'LEGENDARY',
		heldItem: null,
		candyUsed: 0,
		skin: null,
	};

	// Level 100 Legendary Slug on sprayed plot without Hypercharge
	const petWithoutHypercharge = new FarmingPet(slug, { sprayedPlot: true });
	expect(petWithoutHypercharge.fortune).toBe(100); // pet.level = 100

	// Level 100 Legendary Slug on sprayed plot with Hypercharge level 20 (Legendary = 5% per level = 100% boost)
	const petWithHypercharge = new FarmingPet(slug, {
		sprayedPlot: true,
		chips: { HYPERCHARGE_GARDEN_CHIP: 20 },
	});
	// Base = 100, multiplied by 2 (1 + 0.05 * 20) = 200
	expect(petWithHypercharge.fortune).toBe(200);

	// Level 100 Legendary Slug on sprayed plot with Hypercharge level 10 (Rare = 3% per level = 30% boost)
	const petWithRareHypercharge = new FarmingPet(slug, {
		sprayedPlot: true,
		chips: { HYPERCHARGE_GARDEN_CHIP: 10 },
	});
	// Base = 100, multiplied by 1.30 (1 + 0.03 * 10) = 130
	expect(petWithRareHypercharge.fortune).toBe(130);

	// Level 100 Legendary Slug NOT on sprayed plot with Hypercharge (should have 0 fortune from Repugnant Aroma)
	const petNotSprayed = new FarmingPet(slug, {
		sprayedPlot: false,
		chips: { HYPERCHARGE_GARDEN_CHIP: 20 },
	});
	expect(petNotSprayed.fortune).toBe(0);
});

test('Rose Dragon Symbiosis appears in player breakdown', () => {
	// Level 200 Legendary Rose Dragon - Symbiosis activates at level 200
	const roseDragon = {
		uuid: 'test-rose-dragon-uuid',
		type: 'ROSE_DRAGON',
		exp: 60000000000, // Very high exp for level 200
		active: true,
		tier: 'LEGENDARY',
		heldItem: null,
		candyUsed: 0,
		skin: null,
	};

	// Level 100 Legendary Elephant - should count as maxed pet for Symbiosis
	const elephant = {
		uuid: 'test-elephant-uuid',
		type: 'ELEPHANT',
		exp: 30000000000, // Level 100
		active: false,
		tier: 'LEGENDARY',
		heldItem: null,
		candyUsed: 0,
		skin: null,
	};

	// Level 100 Legendary Mooshroom - should also count
	const mooshroom = {
		uuid: 'test-mooshroom-uuid',
		type: 'MOOSHROOM_COW',
		exp: 30000000000, // Level 100
		active: false,
		tier: 'LEGENDARY',
		heldItem: null,
		candyUsed: 0,
		skin: null,
	};

	const player = new FarmingPlayer({
		pets: [roseDragon, elephant, mooshroom],
		farmingLevel: 60,
	});

	// The player should have selected the Rose Dragon (active)
	expect(player.selectedPet?.type).toBe('ROSE_DRAGON');

	// Get the breakdown which includes late calculations
	const breakdown = player.selectedPet?.getFullBreakdown(player);

	// Symbiosis: 3 fortune per maxed farming pet (2 maxed pets = 6 fortune)
	expect(breakdown?.['Symbiosis']).toBeDefined();
	expect(breakdown?.['Symbiosis'].value).toBe(6);
	expect(breakdown?.['Symbiosis'].stat).toBe(Stat.FarmingFortune);

	expect(breakdown?.['Base Stats']).toBeDefined();
});

test('Pig Pet Shining Stampede shows potato fortune in pet breakdown', () => {
	const pig = {
		uuid: 'test-pig-uuid',
		type: 'PIG',
		exp: 30000000000, // Level 100
		active: true,
		tier: 'LEGENDARY',
		heldItem: null,
		candyUsed: 0,
		skin: null,
	};

	const player = new FarmingPlayer({
		pets: [pig],
		bestiaryKills: {
			shiny_pig_1: 60,
		},
	});

	expect(player.selectedPet?.type).toBe('PIG');

	const breakdown = player.selectedPet?.getFullBreakdown(player);

	expect(breakdown?.['Potato Fortune']).toStrictEqual({ value: 20, stat: Stat.PotatoFortune });
	expect(breakdown?.['Shining Stampede']).toStrictEqual({ value: 50, stat: Stat.PotatoFortune });
});

test('Pet progress exposes separate upgrades for each owned pet', () => {
	const player = new FarmingPlayer({
		gardenLevel: 15,
		pets: [
			{
				uuid: 'test-elephant-progress',
				type: 'ELEPHANT',
				exp: 0,
				active: true,
				tier: 'LEGENDARY',
				heldItem: null,
				candyUsed: 0,
				skin: null,
			},
			{
				uuid: 'test-bee-progress',
				type: 'BEE',
				exp: 0,
				active: false,
				tier: 'LEGENDARY',
				heldItem: null,
				candyUsed: 0,
				skin: null,
			},
		],
	});

	const petProgress = player.getPetProgress([Stat.FarmingFortune]);

	expect(petProgress.map((progress) => progress.name)).toStrictEqual(['Elephant Pet', 'Bee Pet']);
	expect(
		player.getProgress([Stat.FarmingFortune]).find((progress) => progress.name === 'Elephant Pet')
	).toBeUndefined();

	const elephant = petProgress.find((progress) => progress.name === 'Elephant Pet');
	expect(elephant?.stats?.[Stat.FarmingFortune]).toStrictEqual({
		current: 1.5,
		max: 150,
		ratio: 0.01,
	});
	expect(
		elephant?.progress?.find((progress) => progress.name === 'Farming Fortune')?.stats?.[Stat.FarmingFortune]
	).toStrictEqual({
		current: 1.5,
		max: 150,
		ratio: 0.01,
	});
	expect(elephant?.upgrades?.find((upgrade) => upgrade.meta?.type === 'pet_level')?.title).toBe('Elephant Level 2');
	expect(elephant?.upgrades?.find((upgrade) => upgrade.meta?.type === 'pet_item')?.title).toBe('Green Bandana');
});

test('Pet upgrades apply to the targeted pet only', () => {
	const player = new FarmingPlayer({
		gardenLevel: 15,
		pets: [
			{
				uuid: 'test-elephant-upgrade',
				type: 'ELEPHANT',
				exp: 0,
				active: true,
				tier: 'LEGENDARY',
				heldItem: null,
				candyUsed: 0,
				skin: null,
			},
			{
				uuid: 'test-bee-upgrade',
				type: 'BEE',
				exp: 0,
				active: false,
				tier: 'LEGENDARY',
				heldItem: null,
				candyUsed: 0,
				skin: null,
			},
		],
	});

	const elephantProgress = player
		.getPetProgress([Stat.FarmingFortune])
		.find((progress) => progress.name === 'Elephant Pet');
	const levelUpgrade = elephantProgress?.upgrades?.find((upgrade) => upgrade.meta?.type === 'pet_level');
	const itemUpgrade = elephantProgress?.upgrades?.find((upgrade) => upgrade.title === 'Green Bandana');

	expect(levelUpgrade).toBeDefined();
	expect(itemUpgrade).toBeDefined();

	player.applyUpgrade(levelUpgrade!);
	expect(player.pets.find((pet) => pet.pet.uuid === 'test-elephant-upgrade')?.level).toBe(2);
	expect(player.pets.find((pet) => pet.pet.uuid === 'test-bee-upgrade')?.level).toBe(1);

	player.applyUpgrade(itemUpgrade!);
	expect(player.pets.find((pet) => pet.pet.uuid === 'test-elephant-upgrade')?.pet.heldItem).toBe('GREEN_BANDANA');
	expect(player.selectedPet?.pet.heldItem).toBe('GREEN_BANDANA');
});

test('Pet upgrades exclude pet item swaps that lower requested fortune stats', () => {
	const player = new FarmingPlayer({
		gardenLevel: 15,
		pets: [
			{
				uuid: 'test-elephant-downgrade',
				type: 'ELEPHANT',
				exp: 0,
				active: true,
				tier: 'LEGENDARY',
				heldItem: 'GREEN_BANDANA',
				candyUsed: 0,
				skin: null,
			},
		],
	});

	const elephantProgress = player
		.getPetProgress([Stat.FarmingFortune])
		.find((progress) => progress.name === 'Elephant Pet');

	expect(elephantProgress?.upgrades?.find((upgrade) => upgrade.title === 'Yellow Bandana')).toBeUndefined();
	expect(
		elephantProgress?.upgrades?.find((upgrade) => (upgrade.stats?.[Stat.FarmingFortune] ?? 0) < 0)
	).toBeUndefined();
});
