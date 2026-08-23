import { describe, expect, test } from 'vitest';
import { normalizeRatesData, type PartialRatesData } from './ratesData';

describe('ratesData migration', () => {
	test('preserves unrelated and pest settings while retiring saved loadout catalogs', () => {
		const migrated = normalizeRatesData({
			v: 10,
			strength: 321,
			bzMode: 'insta',
			pestFarming: {
				selectedCrop: 'Wheat',
				sprayedPlot: false,
				loadoutProfiles: {
					'player:profile': { stale: true },
				},
				phaseLoadouts: {
					farm: { armorSetId: 'main' },
					spawn: { armorSetId: 'spawn' },
				},
			},
		} as unknown as PartialRatesData);

		expect(migrated.v).toBe(11);
		expect(migrated.strength).toBe(321);
		expect(migrated.bzMode).toBe('insta');
		expect(migrated.pestFarming.selectedCrop).toBe('Wheat');
		expect(migrated.pestFarming.sprayedPlot).toBe(false);
		expect('loadoutProfiles' in migrated.pestFarming).toBe(false);
		expect(migrated.pestFarming.rateSettings.blocksPerSecond).toBeGreaterThan(0);
	});
});
