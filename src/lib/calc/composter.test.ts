import { describe, expect, test } from 'vitest';
import type { RatesItemPriceData } from '$lib/api/elite';
import {
	getCheapestUsableMaterial,
	getComposterPriceMap,
	getComposterPurchasePrice,
	getCompostSellPrice,
} from './composter';

describe('composter prices', () => {
	const prices = {
		BAZAAR: {
			bazaar: {
				averageBuy: 120,
				buy: 125,
				averageBuyOrder: 100,
				buyOrder: 105,
				averageSell: 90,
				sell: 88,
				averageSellOrder: 110,
				sellOrder: 115,
			},
		},
		AUCTION: {
			auctions: [{ variantKey: '', lowest: 2_500, rawLowest: 2_300, last: 2_700 }],
		},
		COMPOST: {
			bazaar: { averageSell: 30_000, sell: 29_500, averageSellOrder: 31_500, sellOrder: 32_000 },
		},
	} as unknown as RatesItemPriceData;

	test('uses the requested Bazaar purchase side and falls back to auctions', () => {
		expect(getComposterPurchasePrice(prices.BAZAAR, 'instabuy')).toBe(120);
		expect(getComposterPurchasePrice(prices.BAZAAR, 'buyorder')).toBe(100);
		expect(getComposterPurchasePrice(prices.AUCTION, 'instabuy')).toBe(2_500);
	});

	test('builds a reusable input price map', () => {
		expect(getComposterPriceMap(prices, 'buyorder')).toMatchObject({ BAZAAR: 100, AUCTION: 2_500 });
	});

	test('uses the requested Compost sale side', () => {
		expect(getCompostSellPrice(prices, 'instasell')).toBe(30_000);
		expect(getCompostSellPrice(prices, 'sellorder')).toBe(31_500);
	});

	test('skips cheap materials that do not fit the current capacity', () => {
		expect(
			getCheapestUsableMaterial([
				{
					itemId: 'A',
					name: 'A',
					value: 10,
					unitPrice: 1,
					coinsPerValue: 0.1,
					itemsPerCycle: 1,
					costPerCycle: 1,
					fitsCapacity: false,
				},
				{
					itemId: 'B',
					name: 'B',
					value: 10,
					unitPrice: 2,
					coinsPerValue: 0.2,
					itemsPerCycle: 1,
					costPerCycle: 2,
					fitsCapacity: true,
				},
			])?.itemId
		).toBe('B');
	});
});
