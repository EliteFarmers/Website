import { expect, test } from 'vitest';
import { Crop, MAX_CROP_FORTUNE } from '../constants/crops';
import { FarmingPet } from '../fortune/farmingpet.js';
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
		[Crop.Melon]: 240000,
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
	expect(result['ENCHANTED_GOLDEN_CARROT'].fractionalItems).toBe(1.015625);
	expect(result['ENCHANTED_GOLDEN_CARROT'].fractionalCost).toBe(0);
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

test('Tool Exp Capsules include seeds for wheat', () => {
	const result = calculateDetailedDrops({
		crop: Crop.Wheat,
		blocksBroken: 50_000,
		farmingFortune: 100,
		bountiful: true,
		mooshroom: false,
		maxTool: true,
	});

	// With 100 farming fortune: wheat collection = 100k, seeds (merged) = 100k
	// Capsules are based on (wheat collection + seeds) / 200k => 1 capsule
	expect(result.otherCollection['Seeds']).toBe(100_000);
	expect(result.items[Crop.Seeds]).toBe(100_000);

	expect(result.items['TOOL_EXP_CAPSULE']).toBe(1);
	expect(result.otherCollection['Tool Exp Capsule']).toBe(1);
	expect(result.coinSources['Tool Exp Capsule']).toBe(100_000);
});

test('Tool Exp Capsules include seeds for wheat (average drops)', () => {
	const drops = calculateDetailedAverageDrops({
		blocksBroken: 50_000,
		farmingFortune: 100,
		bountiful: true,
		mooshroom: false,
		maxTool: true,
	});

	expect(drops[Crop.Wheat].otherCollection['Seeds']).toBe(100_000);
	expect(drops[Crop.Wheat].items['TOOL_EXP_CAPSULE']).toBe(1);
});

test('Warty RNG Drops', () => {
	const result = calculateDetailedDrops({
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: true,
		attributes: {
			wart_eater: 500, // Max level
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

test('Cropeetle shard increases special crop bonus', () => {
	const resultWithShard = calculateDetailedDrops({
		crop: Crop.Wheat,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		attributes: {
			crop_bug: 100, // Max level (10)
		},
	});

	const resultWithoutShard = calculateDetailedDrops({
		crop: Crop.Wheat,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
	});

	// Max level (10) gives 20% bonus => 1.2x multiplier on special crops
	expect(resultWithShard.specialCropBonus).toBe(0.2);
	expect(resultWithShard.specialCropBonusBreakdown).toStrictEqual({ 'Cropeetle Shard': 0.2 });
	expect(resultWithoutShard.specialCropBonus).toBe(0);

	// Cropie values should be 20% higher with max shard
	expect(resultWithShard.items['CROPIE']).toBeCloseTo(resultWithoutShard.items['CROPIE'] * 1.2, 1);
});

test('Rarefinder and Rose Dragon no longer modify rates directly', () => {
	const result = calculateDetailedDrops({
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		chips: {
			RAREFINDER_GARDEN_CHIP: 20,
		},
		pet: new FarmingPet({
			type: 'ROSE_DRAGON',
			exp: 10 ** 20,
			tier: 'LEGENDARY',
		}),
		attributes: {
			SHARD_WARTYBUG: 500,
		},
	});

	expect(result.specialCropBonus).toBe(0);
	expect(result.rareItemBonus).toBe(0);
	expect(result.rareItemBonusBreakdown).toStrictEqual({ 'Warty Bug Shard (Base)': 0 });
	expect(result.rngItems?.['WARTY']).toBeCloseTo(50, 2);
});

test('Overbloom increases rare crops and rare item drops', () => {
	const baseResult = calculateDetailedDrops({
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		attributes: {
			wart_eater: 500,
		},
	});

	const overbloomResult = calculateDetailedDrops({
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		overbloom: 5,
		attributes: {
			wart_eater: 500,
		},
	});

	expect(overbloomResult.rareItemBonus).toBe(0.05);
	expect(overbloomResult.rareItemBonusBreakdown).toStrictEqual({
		Overbloom: 0.05,
		'Warty Bug Shard (Base)': 0,
	});
	expect(overbloomResult.rngItems?.['WARTY']).toBeCloseTo(50 * 1.05, 2);
	expect(overbloomResult.items['FERMENTO']).toBeCloseTo((baseResult.items['FERMENTO'] ?? 0) * 1.05, 2);

	const baseMoonflower = calculateDetailedDrops({
		crop: Crop.Moonflower,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
	});

	const moonflowerWithOverbloom = calculateDetailedDrops({
		crop: Crop.Moonflower,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		overbloom: 5,
	});

	expect(moonflowerWithOverbloom.rareItemBonus).toBe(0.05);
	expect(moonflowerWithOverbloom.rareItemBonusBreakdown.Overbloom).toBe(0.05);
	expect(moonflowerWithOverbloom.items['HELIANTHUS']).toBeCloseTo((baseMoonflower.items['HELIANTHUS'] ?? 0) * 1.05, 2);
});

test('Multiple rate modifiers stack correctly with multiplicative formula', () => {
	const result = calculateDetailedDrops({
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		attributes: {
			crop_bug: 100, // Max level 10 = 20% special crop bonus
			wart_eater: 500,
		},
		overbloom: 77.5,
	});

	// Special crop bonus: Only Cropeetle 20%
	expect(result.specialCropBonus).toBeCloseTo(0.2, 4);

	// Rare item bonus: 77.5 Overbloom = 77.5%
	expect(result.rareItemBonus).toBeCloseTo(0.775, 4);

	// Base warty is 50, with 77.5% bonus should be 88.75
	expect(result.rngItems?.['WARTY']).toBeCloseTo(50 * 1.775, 1);
});

test('Melon NPC total matches the visible coin breakdown when special crop modifiers are active', () => {
	const result = calculateDetailedDrops({
		crop: Crop.Melon,
		blocksBroken: 72_000,
		farmingFortune: 100,
		bountiful: true,
		mooshroom: false,
		armorPieces: 4,
		attributes: {
			crop_bug: 100,
		},
	});

	const visibleTotal = Object.values(result.coinSources).reduce((sum, value) => sum + value, 0);

	expect(result.coinSources.Squash).toBe(1_944_000);
	expect(result.npcCoins).toBe(visibleTotal);
});

test('Average melon drops keep NPC total in sync with the visible coin breakdown', () => {
	const result = calculateDetailedAverageDrops({
		blocksBroken: 72_000,
		farmingFortune: 100,
		bountiful: true,
		mooshroom: false,
		armorPieces: 4,
		attributes: {
			crop_bug: 100,
		},
	})[Crop.Melon];

	const visibleTotal = Object.values(result.coinSources).reduce((sum, value) => sum + value, 0);

	expect(result.coinSources.Squash).toBe(1_944_000);
	expect(result.npcCoins).toBe(visibleTotal);
});

test('Rate modifiers do not affect results when level is 0', () => {
	const resultWithZeroLevels = calculateDetailedDrops({
		crop: Crop.Wheat,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		attributes: {
			crop_bug: 0,
		},
		chips: {
			rarefinder: 0,
		},
	});

	const resultWithoutModifiers = calculateDetailedDrops({
		crop: Crop.Wheat,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
	});

	expect(resultWithZeroLevels.specialCropBonus).toBe(0);
	expect(resultWithZeroLevels.rareItemBonus).toBe(0);
	expect(resultWithZeroLevels.items['CROPIE']).toBe(resultWithoutModifiers.items['CROPIE']);
});
