import { describe, expect, test } from 'vitest';
import { sortCropRates } from './crop-rate-sort';

const rows = [
	{ displayName: 'Wheat', npcProfit: 30, bazaarProfit: 20 },
	{ displayName: 'Melon', npcProfit: 20, bazaarProfit: 40 },
	{ displayName: 'Carrot', npcProfit: 10, bazaarProfit: null },
];

describe('crop profit sorting', () => {
	test('sorts highest NPC profit first', () => {
		expect(sortCropRates(rows, 'npcProfit', 'descending').map((row) => row.displayName)).toEqual([
			'Wheat',
			'Melon',
			'Carrot',
		]);
	});
	test('reverses NPC profit order', () => {
		expect(sortCropRates(rows, 'npcProfit', 'ascending').map((row) => row.displayName)).toEqual([
			'Carrot',
			'Melon',
			'Wheat',
		]);
	});
	test('sorts Bazaar profit independently of NPC profit', () => {
		expect(sortCropRates(rows, 'bazaarProfit', 'descending').map((row) => row.displayName)).toEqual([
			'Melon',
			'Wheat',
			'Carrot',
		]);
	});
	test('keeps missing prices last when sorting lowest Bazaar profit first', () => {
		expect(sortCropRates(rows, 'bazaarProfit', 'ascending').map((row) => row.displayName)).toEqual([
			'Wheat',
			'Melon',
			'Carrot',
		]);
	});
	test('orders unpriced crops by NPC profit without mutating the source', () => {
		const unpriced = rows.map((row) => ({ ...row, bazaarProfit: null })).reverse();
		expect(sortCropRates(unpriced, 'bazaarProfit', 'descending').map((row) => row.displayName)).toEqual([
			'Wheat',
			'Melon',
			'Carrot',
		]);
		expect(unpriced[0].displayName).toBe('Carrot');
	});
	test('breaks equal profits by crop name', () => {
		const tied = rows.map((row) => ({ ...row, npcProfit: 10 }));
		expect(sortCropRates(tied, 'npcProfit', 'descending').map((row) => row.displayName)).toEqual([
			'Carrot',
			'Melon',
			'Wheat',
		]);
	});
});
