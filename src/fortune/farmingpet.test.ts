import { expect, test } from 'vitest';
import { FarmingPet } from './farmingpet';

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
		'Base Stats': 10,
		'Farming Fortune': 100,
	});

	const petWithLevel = new FarmingPet(mooshroom, { gardenLevel: 15 });
	expect(petWithLevel.fortune).toBe(170);

	expect(petWithLevel.breakdown).toStrictEqual({
		'Base Stats': 10,
		'Farming Fortune': 100,
		'Green Bandana': 60,
	});

	const petWithStrength = new FarmingPet(mooshroom, { gardenLevel: 15, strength: 1500 });
	expect(petWithStrength.fortune).toBe(222);

	expect(petWithStrength.breakdown).toStrictEqual({
		'Base Stats': 10,
		'Farming Fortune': 100,
		'Green Bandana': 60,
		'Farming Strength Fortune': 52,
	});
});

test('T-Rex pet test', () => {
	const tRex = {
		uuid: '7118abbe-6b0d-4f8d-b424-ecfa7f45c4df',
		type: 'TYRANNOSAURUS',
		exp: 30283813.86580253,
		active: false,
		tier: 'LEGENDARY',
		heldItem: 'BROWN_BANDANA',
		candyUsed: 0,
		skin: null,
	};

	const pet = new FarmingPet(tRex);
	expect(pet.fortune).toBe(0);
});
