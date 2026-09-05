import { describe, expect, test } from 'vitest';
import { Crop, type DetailedDropsFromEffectsResult } from 'farming-weight';
import type { RatesItemPriceData } from '$lib/api/elite';
import { calculateBestBazaarProfit } from './fortune-compare';
import { calculateCropBazaarProfit } from './crop-bazaar-profit';

const wheat: DetailedDropsFromEffectsResult = {
	npcPrice: 6,
	collection: 160,
	npcCoins: 990,
	fortune: 0,
	blocksBroken: 160,
	coinSources: { Collection: 960, Seeds: 30 },
	otherCollection: { Normal: 160 },
	items: { [Crop.Wheat]: 160, [Crop.Seeds]: 10 },
	currencies: {},
	specialCropBonus: 0,
	specialCropBonusBreakdown: {},
	appliedEffects: {},
	effectsBreakdown: {},
};

function market(overrides: Partial<NonNullable<RatesItemPriceData[string]['bazaar']>>): RatesItemPriceData[string] {
	return {
		bazaar: {
			npc: 0,
			sell: 0,
			buy: 0,
			sellOrder: 0,
			buyOrder: 0,
			topBuyOrder: 0,
			topSellOrder: 0,
			averageSell: 0,
			averageBuy: 0,
			averageSellOrder: 0,
			averageTopSellOrder: 0,
			averageBuyOrder: 0,
			averageTopBuyOrder: 0,
			updatedAt: '2026-09-04T00:00:00Z',
			sellVolume: 0n,
			buyVolume: 0n,
			sellMovingWeekly: 0n,
			buyMovingWeekly: 0n,
			sellOrders: 0,
			buyOrders: 0,
			...overrides,
		},
	};
}

const prices: RatesItemPriceData = {
	ENCHANTED_WHEAT: market({ name: 'Enchanted Wheat', averageSell: 900, averageSellOrder: 1000 }),
	SEEDS: market({ name: 'Seeds', npc: 3, averageSell: 4, averageSellOrder: 5 }),
	DYE: market({ name: 'Dye', npc: 0, averageSell: 8000, averageSellOrder: 10000 }),
};

describe('crop Bazaar profit', () => {
	test('includes the Bazaar premium for wheat seeds in the headline', () => {
		expect(calculateBestBazaarProfit(wheat, Crop.Wheat, prices, 'order')).toBe(1050);
		expect(calculateBestBazaarProfit(wheat, Crop.Wheat, prices, 'insta')).toBe(940);
	});

	test('includes expected RNG drops in the headline', () => {
		const result = { ...wheat, rngItems: { DYE: 0.25 } };
		expect(calculateBestBazaarProfit(result, Crop.Wheat, prices, 'order')).toBe(3550);
	});

	test.each(['insta', 'order'] as const)('uses the same %s total for the headline and best craft', (mode) => {
		const result = { ...wheat, rngItems: { DYE: 0.25 } };
		const breakdown = calculateCropBazaarProfit(result, Crop.Wheat, prices, mode);
		expect(breakdown.bazaarProfit).toBe(breakdown.bzOptions[0].total);
		expect(calculateBestBazaarProfit(result, Crop.Wheat, prices, mode)).toBe(breakdown.bazaarProfit);
		expect(breakdown.sellToBazaar.map((item) => item.itemId)).toEqual(['DYE', 'SEEDS']);
	});

	test('keeps regular side drops at NPC when Bazaar pays less and preserves direct coin income', () => {
		const result = { ...wheat, npcCoins: wheat.npcCoins + 50 };
		const lowPrices = { ...prices, SEEDS: market({ npc: 3, averageSellOrder: 2 }) };
		const breakdown = calculateCropBazaarProfit(result, Crop.Wheat, lowPrices, 'order');
		expect(breakdown.bazaarProfit).toBe(1080);
		expect(breakdown.sellToBazaar).toEqual([]);
		expect(breakdown.otherCoinsNpcRemaining).toBe(80);
	});

	test('adds full RNG income because rngItems are not part of the NPC baseline', () => {
		const result = { ...wheat, rngItems: { DYE: 0.25 } };
		const rngPrices = { ...prices, DYE: market({ npc: 100, averageSellOrder: 10000 }) };
		const breakdown = calculateCropBazaarProfit(result, Crop.Wheat, rngPrices, 'order');
		expect(breakdown.bazaarProfit).toBe(3550);
		expect(breakdown.otherCoinsNpcRemaining).toBe(0);
	});

	test('keeps RNG drops at NPC when it pays more', () => {
		const result = { ...wheat, rngItems: { DYE: 0.25 } };
		const rngPrices = { ...prices, DYE: market({ npc: 100, averageSellOrder: 50 }) };
		const breakdown = calculateCropBazaarProfit(result, Crop.Wheat, rngPrices, 'order');
		expect(breakdown.bazaarProfit).toBe(1075);
		expect(breakdown.otherCoinsNpcRemaining).toBe(25);
	});

	test('combines normal and RNG quantities for the same side item exactly once', () => {
		const result = { ...wheat, rngItems: { [Crop.Seeds]: 5 } };
		const breakdown = calculateCropBazaarProfit(result, Crop.Wheat, prices, 'order');
		expect(breakdown.bazaarProfit).toBe(1075);
		expect(breakdown.sellToBazaar).toHaveLength(1);
		expect(breakdown.sellToBazaar[0]).toMatchObject({ itemId: Crop.Seeds, items: 15, gain: 30 });
	});

	test('does not display side-drop income as a complete profit when crop prices are missing', () => {
		const cases: (RatesItemPriceData | undefined)[] = [
			undefined,
			{},
			{ SEEDS: prices.SEEDS },
			{
				...prices,
				ENCHANTED_WHEAT: market({ averageSellOrder: 0 }),
			},
		];
		for (const missingPrices of cases) {
			const breakdown = calculateCropBazaarProfit(wheat, Crop.Wheat, missingPrices, 'order');
			expect(breakdown.bazaarProfit).toBeNull();
			expect(breakdown.bzOptions).toEqual([]);
		}
	});

	test('rounds fractional craft totals once after adding side drops', () => {
		const result = { ...wheat, npcCoins: 966 + 10.3 * 3, items: { [Crop.Wheat]: 161, [Crop.Seeds]: 10.3 } };
		const breakdown = calculateCropBazaarProfit(result, Crop.Wheat, prices, 'order');
		expect(breakdown.bzOptions[0]).toMatchObject({ profit: 1006, total: 1057 });
		expect(breakdown.bazaarProfit).toBe(1057);
	});
});
