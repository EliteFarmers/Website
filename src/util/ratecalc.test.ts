import { expect, test } from 'vitest';
import { Crop, MAX_CROP_FORTUNE } from '../constants/crops';
import { calculateDetailedAverageDrops, calculateDetailedDrops, getPossibleResultsFromCrops } from './ratecalc.js';

test('Rate calc test', () => {
	const drops = calculateDetailedAverageDrops({
		blocksBroken: 24_000,
		farmingFortune: 100,
		bountiful: true,
		mooshroom: true,
	});

	expect(drops[Crop.Wheat].collection).toBe(48_000);
	expect(drops[Crop.Wheat].npcPrice).toBe(6);

	expect(drops[Crop.NetherWart].otherCollection['Fermento']).toBe(2);
	expect(drops[Crop.SugarCane].otherCollection['Fermento']).toBe(2);
	expect(drops[Crop.Cactus].otherCollection['Fermento']).toBe(2);

	expect(drops[Crop.Carrot].items[Crop.Carrot]).toBe(drops[Crop.Carrot].collection - 24000);
	expect(drops[Crop.Carrot].items).toStrictEqual({
		[Crop.Carrot]: 120000,
		CROPIE: 12,
		MUSHROOM_COLLECTION: 24000,
	});

	expect(drops[Crop.Melon].items).toStrictEqual({
		[Crop.Melon]: 426237,
		SQUASH: 7.2,
		MUSHROOM_COLLECTION: 24000,
	});

	expect(drops[Crop.SugarCane].items).toStrictEqual({
		[Crop.SugarCane]: 96000,
		FERMENTO: 1.68,
		MUSHROOM_COLLECTION: 48000,
	});

	expect(drops[Crop.Seeds].items).toStrictEqual({
		[Crop.Seeds]: 48000,
		FERMENTO: 1.68,
		MUSHROOM_COLLECTION: 24000,
	});
	expect(drops[Crop.Seeds].otherCollection['Replenish']).toBe(-24000);
	expect(drops[Crop.Seeds].collection).toBe(48000 + 24000);

	expect(drops[Crop.Wheat].items).toStrictEqual({
		[Crop.Wheat]: 48000,
		[Crop.Seeds]: 48000,
		CROPIE: 12,
		MUSHROOM_COLLECTION: 24000,
	});
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

test('Max fortune results', () => {
	const result = calculateDetailedDrops({
		crop: Crop.Wheat,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: true,
	});

	expect(result.fortune).toBe(MAX_CROP_FORTUNE[Crop.Wheat]);

	const result2 = calculateDetailedDrops({
		crop: Crop.Wheat,
		blocksBroken: 100_000,
		farmingFortune: 173,
		bountiful: true,
		mooshroom: true,
	});

	expect(result2.fortune).toBe(173);
});

test('Warty RNG Drops', () => {
	const result = calculateDetailedDrops({
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: true,
		attributes: {
			SHARD_WARTYBUG: 500, // Max level
		},
	});

	expect(result.fortune).toBe(MAX_CROP_FORTUNE[Crop.NetherWart]);
	expect(result.rngItems?.['WARTY']).toBe(50); // 0.05% chance on 100k blocks broken is 50 drops
});

test('Burrowing RNG Drops', () => {
	const result = calculateDetailedDrops({
		crop: Crop.Mushroom,
		bountiful: true,
		mooshroom: true,
		blocksBroken: 250_000,
	});

	expect(result.rngItems?.['BURROWING_SPORES']).toBe(1);
});
