import { describe, expect, test } from 'vitest';
import { Crop } from '../../constants/crops.js';
import { Stat } from '../../constants/stats.js';
import type { EffectEnvironment } from '../../effects/types.js';
import { enchantEffects } from './enchants.js';

function env(crop?: Crop): EffectEnvironment {
	return {
		crop,
		harvestFeast: false,
		inSeason: false,
		infestedPlot: false,
		selectedCrop: crop,
	};
}

describe('enchant source effects', () => {
	test('flat stat enchant tiers become add-stat effects', () => {
		expect(enchantEffects('harvesting', 6, env(Crop.Wheat), {})).toEqual([
			{
				source: 'Enchant: Harvesting',
				op: 'add-stat',
				stat: Stat.FarmingFortune,
				value: 75,
			},
		]);
	});

	test('computed enchant tiers use player options', () => {
		expect(enchantEffects('green_thumb', 5, env(), { uniqueVisitors: 100 })).toEqual([
			{
				source: 'Enchant: Green Thumb',
				op: 'add-stat',
				stat: Stat.FarmingFortune,
				value: 25,
			},
		]);
	});

	test('computedStats enchant tiers emit crop fortune stat effects', () => {
		expect(
			enchantEffects('dedication', 4, env(Crop.Cactus), {
				milestones: {
					cactus: 46,
					wheat: 10,
				},
			})
		).toEqual(
			expect.arrayContaining([
				{
					source: 'Enchant: Dedication',
					op: 'add-stat',
					stat: Stat.CactusFortune,
					value: 92,
				},
				{
					source: 'Enchant: Dedication',
					op: 'add-stat',
					stat: Stat.WheatFortune,
					value: 20,
				},
			])
		);
	});

	test('cropComputed Overbloom becomes add-rare-pct and respects Moonflower exclusion', () => {
		expect(enchantEffects('ultimate_sunset', 5, env(Crop.NetherWart), {})).toEqual([
			{
				source: 'Enchant: Sunset',
				op: 'add-rare-pct',
				value: 5,
				scope: { tags: ['overbloom'] },
				relatedStats: [Stat.Overbloom],
				meta: {
					description: 'Normal Overbloom',
					valueDisplay: 'stat',
					valueStat: Stat.Overbloom,
				},
			},
		]);

		expect(enchantEffects('ultimate_sunset', 5, env(Crop.Moonflower), {})).toEqual([]);
	});

	test('crop-specific enchants only emit effects for matching crop context', () => {
		expect(enchantEffects('turbo_cactus', 5, env(Crop.Cactus), {})).toEqual([
			{
				source: 'Enchant: Turbo-Cacti',
				op: 'add-stat',
				stat: Stat.CactusFortune,
				value: 25,
			},
		]);
		expect(enchantEffects('turbo_cactus', 5, env(Crop.Wheat), {})).toEqual([]);
	});

	test('unknown or inactive enchant levels emit no effects', () => {
		expect(enchantEffects('missing_enchant', 5, env(), {})).toEqual([]);
		expect(enchantEffects('harvesting', 0, env(), {})).toEqual([]);
		expect(enchantEffects('harvesting', 99, env(), {})).toEqual([]);
	});
});
