import { describe, expect, test } from 'vitest';
import { Stat } from '../../constants/stats.js';
import { buildEffectEnvironment } from '../../effects/environment.js';
import { createFarmingPlayer } from '../../player/player.js';
import { GARDEN_CHIP_CLASSES, GenericChipSource, RarefinderChipSource } from './chips.js';

describe('garden chip source effects', () => {
	test('registry exposes class-backed chip sources for every chip id', () => {
		expect(Object.keys(GARDEN_CHIP_CLASSES).sort()).toEqual([
			'cropshot',
			'evergreen',
			'hypercharge',
			'mechamind',
			'overdrive',
			'quickdraw',
			'rarefinder',
			'sowledge',
			'synthesis',
			'vermin_vaporizer',
		]);
		expect(GARDEN_CHIP_CLASSES.rarefinder).toBeInstanceOf(RarefinderChipSource);
		expect(GARDEN_CHIP_CLASSES.cropshot).toBeInstanceOf(GenericChipSource);
	});

	test('generic chips use normalized input ids and level-derived rarity stats', () => {
		const player = createFarmingPlayer({
			chips: {
				cropshot: 12,
			},
		});
		const env = buildEffectEnvironment(player);

		expect(GARDEN_CHIP_CLASSES.cropshot.getEffects(player, env)).toEqual([
			{
				source: 'Cropshot Chip',
				op: 'add-stat',
				stat: Stat.FarmingFortune,
				value: 48,
			},
		]);
	});

	test('rarefinder emits global Overbloom rare-drop effect instead of add-stat', () => {
		const player = createFarmingPlayer({
			chips: {
				rarefinder: 16,
			},
		});
		const env = buildEffectEnvironment(player);

		expect(GARDEN_CHIP_CLASSES.rarefinder.getEffects(player, env)).toEqual([
			{
				source: 'Rarefinder Chip',
				op: 'add-rare-pct',
				value: 48,
				scope: { tags: ['overbloom'] },
				relatedStats: [Stat.Overbloom],
				meta: {
					description: 'Normal Overbloom',
					valueDisplay: 'stat',
					valueStat: Stat.Overbloom,
				},
			},
		]);
	});

	test('bespoke progress-only chips do not emit scalar effects', () => {
		const player = createFarmingPlayer({
			chips: {
				hypercharge: 20,
				mechamind: 20,
			},
		});
		const env = buildEffectEnvironment(player);

		expect(GARDEN_CHIP_CLASSES.hypercharge.getEffects(player, env)).toEqual([]);
		expect(GARDEN_CHIP_CLASSES.mechamind.getEffects(player, env)).toEqual([]);
	});
});
