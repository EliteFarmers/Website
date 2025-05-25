import { expect, test } from 'vitest';
import { Crop } from '../constants/crops';
import { calculateDetailedAverageDrops, getPossibleResultsFromCrops } from './ratecalc.js';

test('Rate calc test', () => {
	const drops = calculateDetailedAverageDrops({
		blocksBroken: 24_000,
		farmingFortune: 100,
		bountiful: true,
		mooshroom: true,
	});

	expect(drops[Crop.Wheat].collection).toBe(48_000);

	expect(drops[Crop.NetherWart].otherCollection['Fermento']).toBe(2);
	expect(drops[Crop.SugarCane].otherCollection['Fermento']).toBe(2);
	expect(drops[Crop.Cactus].otherCollection['Fermento']).toBe(2);
});

test('Possible results - Wheat', () => {
	const result = getPossibleResultsFromCrops(Crop.Wheat, 26000);

	expect(result[Crop.Wheat].items).toBe(26000);
	expect(result[Crop.Wheat].cost).toBe(0);
	expect(result[Crop.Wheat].remainder).toBe(0);

	expect(result['ENCHANTED_WHEAT'].fractionalItems).toBe(162.5);
	expect(result['ENCHANTED_WHEAT'].cost).toBe(0);
	expect(result['ENCHANTED_HAY_BALE'].fractionalItems).toBe(1.015625);
});

test('Possible results - Carrot', () => {
	const result = getPossibleResultsFromCrops(Crop.Carrot, 26000);

	expect(result[Crop.Carrot].items).toBe(26000);
	expect(result[Crop.Carrot].cost).toBe(0);
	expect(result[Crop.Carrot].remainder).toBe(0);

	expect(result['ENCHANTED_CARROT'].fractionalItems).toBe(162.5);
	expect(result['ENCHANTED_CARROT'].fractionalCost).toBe(0);
	expect(result['ENCHANTED_GOLDEN_CARROT'].fractionalItems).toBe(1.26953125);
	expect(result['ENCHANTED_GOLDEN_CARROT'].fractionalCost).toBe(609.375);
});
