import { describe, expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { SpecialCrop } from '../constants/specialcrops.js';
import { Stat } from '../constants/stats.js';
import { isGlobalOverbloomScope, matchesScopeForDrop, matchesScopeForStat } from './matcher.js';
import {
	produceAddedDrops,
	resolveDropEffects,
	resolveOverbloomBreakdown,
	resolveOverbloomScalar,
	resolveStatBreakdown,
	resolveStatTotal,
} from './resolver.js';
import type { DropContext, Effect, EffectEnvironment, StatContext } from './types.js';

const baseEnv: EffectEnvironment = {
	crop: Crop.Wheat,
	harvestFeast: false,
	inSeason: false,
	infestedPlot: false,
};

function dropCtx(overrides: Partial<DropContext> = {}): DropContext {
	return {
		env: baseEnv,
		crop: Crop.Wheat,
		dropKind: 'rare',
		itemId: 'CROPIE',
		specialCropType: SpecialCrop.Cropie,
		tags: new Set(['overbloom', 'rare-crop', 'special-crop']),
		...overrides,
	};
}

function statCtx(overrides: Partial<StatContext> = {}): StatContext {
	return { env: baseEnv, ...overrides };
}

describe('matchesScopeForDrop', () => {
	test('empty scope matches everything', () => {
		expect(matchesScopeForDrop(undefined, dropCtx())).toBe(true);
		expect(matchesScopeForDrop({}, dropCtx())).toBe(true);
	});

	test('crops field filters by crop', () => {
		expect(matchesScopeForDrop({ crops: [Crop.Wheat] }, dropCtx({ crop: Crop.Wheat }))).toBe(true);
		expect(matchesScopeForDrop({ crops: [Crop.Wheat] }, dropCtx({ crop: Crop.Carrot }))).toBe(false);
	});

	test('items field filters by itemId', () => {
		expect(matchesScopeForDrop({ items: ['CROPIE'] }, dropCtx({ itemId: 'CROPIE' }))).toBe(true);
		expect(matchesScopeForDrop({ items: ['CROPIE'] }, dropCtx({ itemId: 'WARTY' }))).toBe(false);
	});

	test('tags require every listed tag', () => {
		const ctx = dropCtx({ tags: new Set(['overbloom', 'seasoning']) });
		expect(matchesScopeForDrop({ tags: ['overbloom'] }, ctx)).toBe(true);
		expect(matchesScopeForDrop({ tags: ['overbloom', 'seasoning'] }, ctx)).toBe(true);
		expect(matchesScopeForDrop({ tags: ['overbloom', 'feast'] }, ctx)).toBe(false);
	});

	test('specialCropTypes requires a special crop type on the drop', () => {
		expect(
			matchesScopeForDrop(
				{ specialCropTypes: [SpecialCrop.Cropie] },
				dropCtx({ specialCropType: SpecialCrop.Cropie })
			)
		).toBe(true);
		expect(
			matchesScopeForDrop(
				{ specialCropTypes: [SpecialCrop.Cropie] },
				dropCtx({ specialCropType: SpecialCrop.Squash })
			)
		).toBe(false);
		expect(
			matchesScopeForDrop(
				{ specialCropTypes: [SpecialCrop.Cropie] },
				dropCtx({ specialCropType: undefined })
			)
		).toBe(false);
	});

	test('feast / inSeason flags are AND-ed against the env', () => {
		const ctx = dropCtx({ env: { ...baseEnv, harvestFeast: true, inSeason: true } });
		expect(matchesScopeForDrop({ requiresHarvestFeast: true }, ctx)).toBe(true);
		expect(matchesScopeForDrop({ requiresInSeason: true }, ctx)).toBe(true);
		expect(matchesScopeForDrop({ requiresHarvestFeast: true }, dropCtx())).toBe(false);
	});

	test('appliesToAddedDrops: false skips drops produced by add-drop', () => {
		expect(
			matchesScopeForDrop({ appliesToAddedDrops: false }, dropCtx({ fromAddDrop: true }))
		).toBe(false);
		expect(
			matchesScopeForDrop({ appliesToAddedDrops: false }, dropCtx({ fromAddDrop: false }))
		).toBe(true);
	});

	test('match predicate runs last and is AND-ed with declarative fields', () => {
		const scope = {
			crops: [Crop.Wheat],
			match: (ctx: DropContext) => ctx.itemId === 'CROPIE',
		};
		expect(matchesScopeForDrop(scope, dropCtx({ itemId: 'CROPIE' }))).toBe(true);
		expect(matchesScopeForDrop(scope, dropCtx({ itemId: 'OTHER' }))).toBe(false);
		expect(matchesScopeForDrop(scope, dropCtx({ crop: Crop.Carrot, itemId: 'CROPIE' }))).toBe(false);
	});
});

describe('matchesScopeForStat', () => {
	test('drop-only fields disqualify the effect outright', () => {
		expect(matchesScopeForStat({ items: ['SEASONING'] }, statCtx())).toBe(false);
		expect(matchesScopeForStat({ dropKinds: ['rare'] }, statCtx())).toBe(false);
		expect(matchesScopeForStat({ specialCropTypes: [SpecialCrop.Cropie] }, statCtx())).toBe(false);
		expect(matchesScopeForStat({ tags: ['overbloom'] }, statCtx())).toBe(false);
		expect(matchesScopeForStat({ match: () => true }, statCtx())).toBe(false);
	});

	test('crop-scoped effect contributes only when the query names that crop', () => {
		expect(
			matchesScopeForStat({ crops: [Crop.Wheat] }, statCtx({ crop: Crop.Wheat }))
		).toBe(true);
		expect(
			matchesScopeForStat({ crops: [Crop.Wheat] }, statCtx({ crop: Crop.Carrot }))
		).toBe(false);
		expect(matchesScopeForStat({ crops: [Crop.Wheat] }, statCtx({ crop: undefined }))).toBe(false);
	});

	test('feast requirements still apply', () => {
		expect(
			matchesScopeForStat(
				{ requiresHarvestFeast: true },
				statCtx({ env: { ...baseEnv, harvestFeast: true } })
			)
		).toBe(true);
		expect(matchesScopeForStat({ requiresHarvestFeast: true }, statCtx())).toBe(false);
	});
});

describe('isGlobalOverbloomScope', () => {
	test('undefined and empty scopes count as global', () => {
		expect(isGlobalOverbloomScope(undefined)).toBe(true);
		expect(isGlobalOverbloomScope({})).toBe(true);
	});

	test('tags: ["overbloom"] is the only allowed tag set', () => {
		expect(isGlobalOverbloomScope({ tags: ['overbloom'] })).toBe(true);
		expect(isGlobalOverbloomScope({ tags: ['overbloom', 'rare-crop'] })).toBe(false);
		expect(isGlobalOverbloomScope({ tags: ['rare-crop'] })).toBe(false);
	});

	test('any narrowing field disqualifies', () => {
		expect(isGlobalOverbloomScope({ crops: [Crop.Wheat] })).toBe(false);
		expect(isGlobalOverbloomScope({ items: ['CROPIE'] })).toBe(false);
		expect(isGlobalOverbloomScope({ specialCropTypes: [SpecialCrop.Cropie] })).toBe(false);
		expect(isGlobalOverbloomScope({ requiresHarvestFeast: true })).toBe(false);
		expect(isGlobalOverbloomScope({ match: () => true })).toBe(false);
		expect(isGlobalOverbloomScope({ appliesToAddedDrops: false })).toBe(false);
	});
});

describe('resolveStatTotal / resolveStatBreakdown', () => {
	const effects: Effect[] = [
		{ source: 'A', op: 'add-stat', stat: Stat.FarmingFortune, value: 10 },
		{ source: 'B', op: 'add-stat', stat: Stat.FarmingFortune, value: 5 },
		{ source: 'C', op: 'add-stat', stat: Stat.Strength, value: 100 },
		// drop-scoped effect should be ignored entirely by stat resolution
		{
			source: 'D',
			op: 'add-stat',
			stat: Stat.FarmingFortune,
			value: 999,
			scope: { items: ['CROPIE'] },
		},
		// crop-scoped effect contributes only when query names that crop
		{
			source: 'E',
			op: 'add-stat',
			stat: Stat.FarmingFortune,
			value: 7,
			scope: { crops: [Crop.Wheat] },
		},
	];

	test('sums add-stat effects matching the stat', () => {
		expect(resolveStatTotal(effects, Stat.FarmingFortune, statCtx())).toBe(15);
		expect(resolveStatTotal(effects, Stat.FarmingFortune, statCtx({ crop: Crop.Wheat }))).toBe(22);
		expect(resolveStatTotal(effects, Stat.FarmingFortune, statCtx({ crop: Crop.Carrot }))).toBe(15);
	});

	test('breakdown groups by source name', () => {
		const out = resolveStatBreakdown(effects, Stat.FarmingFortune, statCtx({ crop: Crop.Wheat }));
		expect(out).toEqual({ A: 10, B: 5, E: 7 });
	});
});

describe('resolveOverbloomScalar', () => {
	const effects: Effect[] = [
		// global Overbloom contributors
		{
			source: 'Rarefinder',
			op: 'add-rare-pct',
			value: 3,
			relatedStats: [Stat.Overbloom],
			scope: { tags: ['overbloom'] },
		},
		{
			source: 'Overpriced',
			op: 'add-rare-pct',
			value: 7,
			relatedStats: [Stat.Overbloom],
		},
		// scoped Overbloom-flavored effect: NOT counted in scalar
		{
			source: 'Hypothetical Seasoning %',
			op: 'add-rare-pct',
			value: 50,
			relatedStats: [Stat.Overbloom],
			scope: { tags: ['seasoning'] },
		},
		// not Overbloom-related: ignored
		{ source: 'Other', op: 'add-rare-pct', value: 100, scope: { tags: ['overbloom'] } },
		// Cropeetle: mul-rare, ignored by Overbloom scalar
		{
			source: 'Cropeetle',
			op: 'mul-rare',
			value: 1.2,
			relatedStats: [Stat.Overbloom],
			scope: { specialCropTypes: [SpecialCrop.Cropie] },
		},
	];

	test('sums only global Overbloom-shaped add-rare-pct effects', () => {
		expect(resolveOverbloomScalar(effects, statCtx(), Stat.Overbloom)).toBe(10);
	});

	test('breakdown matches scalar', () => {
		const out = resolveOverbloomBreakdown(effects, statCtx(), Stat.Overbloom);
		expect(out).toEqual({ Rarefinder: 3, Overpriced: 7 });
	});
});

describe('produceAddedDrops', () => {
	const env: EffectEnvironment = { ...baseEnv, crop: Crop.NetherWart };

	const effects: Effect[] = [
		{
			source: 'Warty Bug Shard',
			op: 'add-drop',
			drop: { itemId: 'WARTY', chance: 0.0001, tags: ['overbloom', 'rare-crop'] },
			scope: { crops: [Crop.NetherWart] },
		},
		{
			source: 'Other',
			op: 'add-drop',
			drop: { itemId: 'OTHER' },
			scope: { crops: [Crop.Wheat] },
		},
	];

	test('returns drops whose env-level scope matches', () => {
		expect(produceAddedDrops(effects, env)).toEqual([
			{
				source: 'Warty Bug Shard',
				payload: { itemId: 'WARTY', chance: 0.0001, tags: ['overbloom', 'rare-crop'] },
			},
		]);
	});

	test('skips when env crop is undefined and scope requires a crop', () => {
		expect(produceAddedDrops(effects, { ...baseEnv, crop: undefined })).toEqual([]);
	});
});

describe('resolveDropEffects pipeline', () => {
	const cropie = dropCtx();
	const warty = dropCtx({
		crop: Crop.NetherWart,
		itemId: 'WARTY',
		specialCropType: undefined,
		tags: new Set(['overbloom', 'rare-crop']),
		fromAddDrop: true,
	});
	const pestDrop = dropCtx({
		dropKind: 'pest',
		itemId: 'PEST_X',
		specialCropType: undefined,
		tags: new Set(['pest']),
	});

	const overbloom: Effect = {
		source: 'Overbloom',
		op: 'add-rare-pct',
		value: 50,
		relatedStats: [Stat.Overbloom],
		scope: { tags: ['overbloom'] },
	};
	const cropeetle: Effect = {
		source: 'Cropeetle',
		op: 'mul-rare',
		value: 1.2,
		relatedStats: [Stat.Overbloom],
		scope: { specialCropTypes: [SpecialCrop.Cropie, SpecialCrop.Squash] },
		meta: { description: '+20% Cropie and Squash drops' },
	};
	const deepFried: Effect = {
		source: 'Deep Fried',
		op: 'mul-drop',
		value: 1.25,
		scope: { tags: ['seasoning'], requiresHarvestFeast: true },
	};

	test('overbloom + cropeetle stack on Cropie: 1.5 * 1.2 = 1.8', () => {
		const r = resolveDropEffects([overbloom, cropeetle], cropie);
		expect(r.addRarePct).toBe(50);
		expect(r.mulRare).toBeCloseTo(1.2);
		expect(r.mulDrop).toBe(1);
		expect((1 + r.addRarePct / 100) * r.mulRare * r.mulDrop).toBeCloseTo(1.8);
		expect(r.applied.map((a) => a.source)).toEqual(['Overbloom', 'Cropeetle']);
		expect(r.applied.find((a) => a.source === 'Cropeetle')).toMatchObject({
			description: '+20% Cropie and Squash drops',
			scope: { specialCropTypes: [SpecialCrop.Cropie, SpecialCrop.Squash] },
			relatedStats: [Stat.Overbloom],
		});
	});

	test('cropeetle does NOT apply to non-special-crop overbloom drops', () => {
		const r = resolveDropEffects([overbloom, cropeetle], warty);
		expect(r.mulRare).toBe(1);
		expect(r.addRarePct).toBe(50);
	});

	test('overbloom does NOT apply to non-overbloom-tagged drops (e.g. pests)', () => {
		const r = resolveDropEffects([overbloom, cropeetle], pestDrop);
		expect(r.addRarePct).toBe(0);
		expect(r.mulRare).toBe(1);
	});

	test('appliesToAddedDrops: false excludes added drops', () => {
		const noAdded: Effect = { ...overbloom, scope: { ...overbloom.scope, appliesToAddedDrops: false } };
		const r = resolveDropEffects([noAdded], warty);
		expect(r.addRarePct).toBe(0);
	});

	test('Deep Fried only fires when feast is active and tag matches', () => {
		const seasoning = dropCtx({
			itemId: 'SEASONING',
			specialCropType: undefined,
			tags: new Set(['overbloom', 'rare-crop', 'seasoning', 'feast']),
			env: { ...baseEnv, harvestFeast: true, inSeason: true },
		});
		const r = resolveDropEffects([deepFried], seasoning);
		expect(r.mulDrop).toBeCloseTo(1.25);
	});

	test('Deep Fried does nothing without feast', () => {
		const seasoning = dropCtx({
			itemId: 'SEASONING',
			specialCropType: undefined,
			tags: new Set(['overbloom', 'rare-crop', 'seasoning', 'feast']),
		});
		const r = resolveDropEffects([deepFried], seasoning);
		expect(r.mulDrop).toBe(1);
	});

	test('multiple mul-rare effects on overlapping scopes multiply', () => {
		const cropeetle2: Effect = { ...cropeetle, source: 'Cropeetle 2' };
		const r = resolveDropEffects([cropeetle, cropeetle2], cropie);
		expect(r.mulRare).toBeCloseTo(1.44);
	});

	test('mul-rare with negative value throws', () => {
		const bad: Effect = { source: 'Bad', op: 'mul-rare', value: -0.5 };
		expect(() => resolveDropEffects([bad], cropie)).toThrow(/must be >= 0/);
	});

	test('mul-rare value 1.0 is identity and not recorded', () => {
		const noop: Effect = { source: 'Noop', op: 'mul-rare', value: 1 };
		const r = resolveDropEffects([noop], cropie);
		expect(r.mulRare).toBe(1);
		expect(r.applied).toEqual([]);
	});

	test('phase ordering is deterministic regardless of input order', () => {
		const a = resolveDropEffects([overbloom, cropeetle], cropie);
		const b = resolveDropEffects([cropeetle, overbloom], cropie);
		expect(a.addRarePct).toBe(b.addRarePct);
		expect(a.mulRare).toBe(b.mulRare);
		expect(a.applied.map((x) => x.phase)).toEqual(['add-rare', 'mul-rare']);
		expect(b.applied.map((x) => x.phase)).toEqual(['add-rare', 'mul-rare']);
	});
});
