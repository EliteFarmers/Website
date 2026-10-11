import { expect, test } from 'vitest';
import { getBestSprayonatorTier, SprayonatorTier } from './specific.js';

test('getBestSprayonatorTier picks the highest owned tier', () => {
	expect(getBestSprayonatorTier(['SPRAYONATOR', 'JUICY_SPRAYONATOR'])).toBe(SprayonatorTier.Juicy);
	expect(getBestSprayonatorTier(['SALTY_SPRAYONATOR', 'SPRAYONATOR'])).toBe(SprayonatorTier.Salty);
	expect(getBestSprayonatorTier(['SPRAYONATOR'])).toBe(SprayonatorTier.Regular);
	expect(getBestSprayonatorTier([])).toBe(SprayonatorTier.Regular);
	expect(getBestSprayonatorTier(['THEORETICAL_HOE_WHEAT_3', undefined])).toBe(SprayonatorTier.Regular);
});
