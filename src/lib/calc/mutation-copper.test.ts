import { describe, expect, it } from 'vitest';
import {
	calculateMutationCopperRatios,
	getRoseDragonBonus,
	getSynthesisChipFromLevel,
	sortMutationCopperRatios,
	type MutationAnalysisSource,
} from './mutation-copper';

const mutation: MutationAnalysisSource = {
	id: 'TEST_MUTATION',
	display: { name: 'Test Mutation' },
	analysis: { baseCost: 1_000, copper: 100 },
};

describe('mutation Copper calculations', () => {
	it('matches the synthesis rarity thresholds and per-level bonuses from the Bot command', () => {
		expect(getSynthesisChipFromLevel(10)).toMatchObject({ rarity: 'Rare', bonus: 10 });
		expect(getSynthesisChipFromLevel(11)).toMatchObject({ rarity: 'Epic', bonus: 16.5 });
		expect(getSynthesisChipFromLevel(16)).toMatchObject({ rarity: 'Legendary', bonus: 32 });
		expect(getSynthesisChipFromLevel(20)).toMatchObject({ rarity: 'Legendary', bonus: 40 });
	});

	it('only applies the Rose Dragon bonus above level 100', () => {
		expect(getRoseDragonBonus(100)).toBe(0);
		expect(getRoseDragonBonus(101)).toBeCloseTo(10.1);
		expect(getRoseDragonBonus(200)).toBe(20);
	});

	it('adds the fixed analysis fee to the mutation price and applies Copper boosts additively', () => {
		const [result] = calculateMutationCopperRatios(
			[mutation],
			{
				TEST_MUTATION: {
					bazaar: {
						averageBuy: 500,
						buy: 700,
						averageBuyOrder: 400,
						buyOrder: 600,
					},
				},
			},
			20,
			200
		);

		expect(result.copper).toBe(160);
		expect(result.buyCoinTotal).toBe(1_500);
		expect(result.buyOrderCoinTotal).toBe(1_400);
		expect(result.buyCoinPerCopper).toBe(9.375);
		expect(result.buyOrderCoinPerCopper).toBe(8.75);
	});

	it('falls back to current prices and sorts unavailable mutations last', () => {
		const secondMutation = { ...mutation, id: 'NO_PRICE', display: { name: 'No Price' } };
		const ratios = calculateMutationCopperRatios(
			[secondMutation, mutation],
			{ TEST_MUTATION: { bazaar: { averageBuy: 0, buy: 500, averageBuyOrder: 0, buyOrder: 400 } } },
			0,
			0
		);

		expect(ratios[1].buyCoinTotal).toBe(1_500);
		expect(ratios[1].buyOrderCoinTotal).toBe(1_400);
		expect(sortMutationCopperRatios(ratios, 'instabuy').map((entry) => entry.id)).toEqual([
			'TEST_MUTATION',
			'NO_PRICE',
		]);
	});
});
