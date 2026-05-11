import { describe, expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { createFarmingPlayer } from '../player/player.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import { buildEffectEnvironment } from './environment.js';

function makePlayer(overrides: PlayerOptions = {}) {
	return createFarmingPlayer({
		farmingLevel: 60,
		...overrides,
	});
}

describe('buildEffectEnvironment', () => {
	test('defaults: no feast, no infested plot, no selected crop', () => {
		const env = buildEffectEnvironment(makePlayer());
		expect(env).toEqual({
			crop: undefined,
			harvestFeast: false,
			inSeason: false,
			infestedPlot: false,
			selectedCrop: undefined,
		});
	});

	test('crop is propagated', () => {
		const env = buildEffectEnvironment(makePlayer(), Crop.Wheat);
		expect(env.crop).toBe(Crop.Wheat);
	});

	test('inSeason requires harvestFeast.active AND crop in inSeasonCrops', () => {
		const player = makePlayer({
			harvestFeast: { active: true, inSeasonCrops: [Crop.Wheat] },
		});
		expect(buildEffectEnvironment(player, Crop.Wheat).inSeason).toBe(true);
		expect(buildEffectEnvironment(player, Crop.Carrot).inSeason).toBe(false);
		expect(buildEffectEnvironment(player).inSeason).toBe(false);
	});

	test('grandFeast forces inSeason true regardless of inSeasonCrops', () => {
		const player = makePlayer({
			harvestFeast: { active: true, grandFeast: true, inSeasonCrops: [Crop.Wheat] },
		});
		expect(buildEffectEnvironment(player, Crop.Carrot).inSeason).toBe(true);
		expect(buildEffectEnvironment(player, Crop.Wheat).inSeason).toBe(true);
	});

	test('inactive feast keeps harvestFeast false', () => {
		const player = makePlayer({
			harvestFeast: { active: false, inSeasonCrops: [Crop.Wheat] },
		});
		const env = buildEffectEnvironment(player, Crop.Wheat);
		expect(env.harvestFeast).toBe(false);
		expect(env.inSeason).toBe(false);
	});

	test('infestedPlot derives from infestedPlotProbability > 0', () => {
		expect(buildEffectEnvironment(makePlayer({ infestedPlotProbability: 0.5 })).infestedPlot).toBe(true);
		expect(buildEffectEnvironment(makePlayer({ infestedPlotProbability: 0 })).infestedPlot).toBe(false);
		expect(buildEffectEnvironment(makePlayer()).infestedPlot).toBe(false);
	});

	test('selectedCrop is forwarded from player options', () => {
		const player = makePlayer({ selectedCrop: Crop.Sunflower });
		expect(buildEffectEnvironment(player).selectedCrop).toBe(Crop.Sunflower);
	});
});
