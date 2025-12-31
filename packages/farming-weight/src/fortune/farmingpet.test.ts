import { expect, test } from 'vitest';
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
