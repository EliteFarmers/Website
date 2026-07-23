import { expect, test } from 'vitest';
import { Crop } from '../../constants/crops.js';
import { Rarity, REFORGES } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { reforgeEffects } from '../sources/reforges.js';
import { BaseReforge, REFORGE_SOURCES } from './index.js';

test('all reforge definitions are class-backed sources', () => {
	expect(Object.keys(REFORGE_SOURCES).sort()).toEqual([
		'beady',
		'blessed',
		'blooming',
		'bountiful',
		'bustling',
		'buzzing',
		'deep_fried',
		'earthy',
		'green_thumb',
		'mantid',
		'mossy',
		'overpriced',
		'robust',
		'rooted',
		'squeaky',
		'thorny',
	]);
	expect(REFORGES).toBe(REFORGE_SOURCES);
	for (const reforge of Object.values(REFORGE_SOURCES)) {
		expect(reforge).toBeInstanceOf(BaseReforge);
	}
});

test('overpriced maps Overbloom stat tiers through generic reforge effects', () => {
	expect(reforgeEffects('overpriced', Rarity.Legendary)).toContainEqual(
		expect.objectContaining({
			source: 'Reforge: Overpriced',
			op: 'add-rare-pct',
			value: 7,
			scope: { tags: ['overbloom'] },
			relatedStats: [Stat.Overbloom],
		})
	);
});

test('thorny uses the live Farming Fortune, Overbloom, and application costs', () => {
	const thorny = REFORGE_SOURCES.thorny!;
	expect(
		[Rarity.Common, Rarity.Uncommon, Rarity.Rare, Rarity.Epic, Rarity.Legendary, Rarity.Mythic].map((rarity) =>
			thorny.getTier(rarity)
		)
	).toEqual([
		{ stats: { [Stat.FarmingFortune]: 2, [Stat.Overbloom]: 0.25 }, cost: 20_000 },
		{ stats: { [Stat.FarmingFortune]: 4, [Stat.Overbloom]: 0.5 }, cost: 40_000 },
		{ stats: { [Stat.FarmingFortune]: 6, [Stat.Overbloom]: 0.75 }, cost: 80_000 },
		{ stats: { [Stat.FarmingFortune]: 8, [Stat.Overbloom]: 1 }, cost: 150_000 },
		{ stats: { [Stat.FarmingFortune]: 10, [Stat.Overbloom]: 1.25 }, cost: 300_000 },
		{ stats: { [Stat.FarmingFortune]: 12, [Stat.Overbloom]: 1.5 }, cost: 600_000 },
	]);
});

test('deep fried owns its Seasoning multiplier on the class', () => {
	expect(reforgeEffects('deep_fried', Rarity.Legendary)).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				source: 'Reforge: Deep Fried',
				op: 'add-stat',
				stat: Stat.FarmingFortune,
				value: 23,
			}),
			expect.objectContaining({
				source: 'Reforge: Deep Fried',
				op: 'mul-drop',
				value: 1.25,
				scope: { tags: ['seasoning'], requiresHarvestFeast: true },
			}),
		])
	);
});

test('blessed owns its per-crop collection drop effect on the class', () => {
	expect(reforgeEffects('blessed', Rarity.Legendary)).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				source: 'Reforge: Blessed',
				op: 'add-stat',
				stat: Stat.FarmingFortune,
				value: 16,
			}),
			expect.objectContaining({
				source: 'Blessed Reforge',
				op: 'add-drop',
				scope: { crops: [Crop.NetherWart] },
				drop: {
					itemId: Crop.NetherWart,
					output: 'collection',
					baseAmount: 0.0022 * 160,
					dropKind: 'crop',
					tags: ['crop-drop'],
				},
			}),
		])
	);
});

test('generic reforge effects preserve every non-Overbloom stat in a tier', () => {
	expect(reforgeEffects('green_thumb', Rarity.Mythic)).toEqual([
		{
			source: 'Reforge: Green Thumb',
			op: 'add-stat',
			stat: Stat.FarmingFortune,
			value: 6,
		},
		{
			source: 'Reforge: Green Thumb',
			op: 'add-stat',
			stat: Stat.Speed,
			value: 9,
		},
	]);
});

test('reforge effects support caller-provided source names', () => {
	expect(reforgeEffects('bountiful', Rarity.Legendary, 'Selected Tool Reforge')).toEqual([
		{
			source: 'Selected Tool Reforge',
			op: 'add-stat',
			stat: Stat.FarmingFortune,
			value: 7,
		},
		{
			source: 'Selected Tool Reforge',
			op: 'add-stat',
			stat: Stat.Speed,
			value: 8,
		},
	]);
});

test('unknown reforges emit no effects', () => {
	expect(reforgeEffects('missing_reforge', Rarity.Legendary)).toEqual([]);
});
