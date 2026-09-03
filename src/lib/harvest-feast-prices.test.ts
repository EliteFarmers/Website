import type { RatesItemPriceData } from '$lib/api/elite';
import { describe, expect, it } from 'vitest';
import {
	getHarvestFeastMaterialId,
	getHarvestFeastMaterialIds,
	getHarvestFeastMaterialPrice,
} from './harvest-feast-prices';

describe('Harvest Feast material prices', () => {
	it('maps display and API crop names through the canonical material lookup', () => {
		expect(getHarvestFeastMaterialId('Wheat')).toBe('CORNUCOPIA');
		expect(getHarvestFeastMaterialId('INK_SACK:3')).toBe('DESIGNER_COFFEE_BEANS');
	});

	it('deduplicates material ids across rotations', () => {
		expect(getHarvestFeastMaterialIds(['Wheat', 'WHEAT', 'Carrot'])).toEqual(['CORNUCOPIA', 'CARROT_ZEST']);
	});

	it('uses the averaged instant-sell price and Bazaar item name', () => {
		const prices = {
			CORNUCOPIA: {
				bazaar: {
					name: 'Cornucopia',
					averageSell: 123_456.7,
				},
			},
		} as unknown as RatesItemPriceData;

		expect(getHarvestFeastMaterialPrice('Wheat', prices)).toEqual({
			itemId: 'CORNUCOPIA',
			name: 'Cornucopia',
			coins: 123_456.7,
		});
	});

	it('keeps the material available when its Bazaar price is missing', () => {
		expect(getHarvestFeastMaterialPrice('Wheat', {})).toEqual({
			itemId: 'CORNUCOPIA',
			name: 'Cornucopia',
			coins: undefined,
		});
	});
});
