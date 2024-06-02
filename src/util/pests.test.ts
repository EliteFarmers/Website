import { expect, test } from 'vitest';
import { fortuneFromPestBestiary, uncountedCropsFromPests } from './pests';
import { Crop } from '../constants/crops';
import { PEST_COLLECTION_ADJUSTMENTS, Pest } from '../constants/pests';

test('Pest bestiary fortune', () => {
	const bestiaryKills = {
		pest_fly_1: 1,
		pest_beetle_1: 2,
		random_thing: 100
	}

	expect(fortuneFromPestBestiary(bestiaryKills)).toBeCloseTo(1.2)
})

test('Uncounted crops from pests', () => {
	const bestiaryKills = {
		pest_fly_1: 13414,
		pest_beetle_1: 10,
		pest_worm_1: 51,
	}

	const uncounted = uncountedCropsFromPests(bestiaryKills);

	expect(Object.values(uncounted)).toHaveLength(3);
	expect(uncounted[Crop.NetherWart]).toBe(0);
	expect(uncounted[Crop.Melon]).toBe(Math.ceil(PEST_COLLECTION_ADJUSTMENTS[Pest.Worm][50] ?? 0));
	expect(uncounted[Crop.Wheat]).toBe(311892563);
})