import { describe, expect, it } from 'vitest';
import type { FortuneUpgrade, PestFarmingUpgradeRateImpact } from 'farming-weight';
import { shouldDisplayPestUpgrade } from './pest-upgrade-visibility';

const ordinary = { title: 'Reforge to Thorny', meta: { type: 'reforge' } } as FortuneUpgrade;
const petItem = { title: 'Brown Bandana', meta: { type: 'pet_item' } } as FortuneUpgrade;

function impact(coinsPerHour: number, complete = true): PestFarmingUpgradeRateImpact {
	return { valuationDelta: { coinsPerHour, complete } } as PestFarmingUpgradeRateImpact;
}

describe('shouldDisplayPestUpgrade', () => {
	it('keeps ordinary upgrades visible while rates load', () => {
		expect(shouldDisplayPestUpgrade(ordinary, undefined)).toBe(true);
	});

	it('hides confirmed negative upgrades but preserves no-change paths', () => {
		expect(shouldDisplayPestUpgrade(ordinary, impact(-42_230))).toBe(false);
		expect(shouldDisplayPestUpgrade(ordinary, impact(0))).toBe(true);
	});

	it('keeps the existing stricter rule for pet item recommendations', () => {
		expect(shouldDisplayPestUpgrade(petItem, impact(100, false))).toBe(false);
		expect(shouldDisplayPestUpgrade(petItem, impact(100))).toBe(true);
	});
});
