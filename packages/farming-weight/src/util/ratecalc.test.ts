import { expect, test } from 'vitest';
import { Crop, MAX_CROP_FORTUNE } from '../constants/crops';
import { Stat } from '../constants/stats.js';
import { buildEffectEnvironmentFromOptions } from '../effects/environment.js';
import type { Effect } from '../effects/types.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import { getPossibleResultsFromCrops } from './ratecalc.js';
import {
	type CalculateDetailedDropsFromEffectsOptions,
	calculateDetailedDropsFromEffects,
	type DetailedDropsFromEffectsResult,
} from './ratecalc-effects.js';

const crops = [
	Crop.Cactus,
	Crop.Carrot,
	Crop.CocoaBeans,
	Crop.Melon,
	Crop.Mushroom,
	Crop.NetherWart,
	Crop.Potato,
	Crop.Pumpkin,
	Crop.SugarCane,
	Crop.Wheat,
	Crop.Seeds,
	Crop.Sunflower,
	Crop.Moonflower,
	Crop.WildRose,
] as const;

type DetailedOptions = Omit<CalculateDetailedDropsFromEffectsOptions, 'env' | 'effects'> & {
	effects?: readonly Effect[];
	harvestFeast?: PlayerOptions['harvestFeast'];
	infestedPlotProbability?: number;
};

type AverageDetailedOptions = Omit<DetailedOptions, 'crop'> & {
	cropFortune?: Partial<Record<Crop, number>>;
};

function detailed(options: DetailedOptions): DetailedDropsFromEffectsResult {
	const env = buildEffectEnvironmentFromOptions(
		{
			harvestFeast: options.harvestFeast,
			infestedPlotProbability: options.infestedPlotProbability,
			selectedCrop: options.crop,
		},
		options.crop
	);

	return calculateDetailedDropsFromEffects({
		...options,
		effects: options.effects ?? [],
		env,
	});
}

function averageDetailed(options: AverageDetailedOptions): Record<Crop, DetailedDropsFromEffectsResult> {
	const result = {} as Record<Crop, DetailedDropsFromEffectsResult>;

	for (const crop of crops) {
		const fortune = (options.cropFortune?.[crop] ?? 0) + (options.farmingFortune ?? 0);
		result[crop] = detailed({
			...options,
			crop,
			farmingFortune: fortune > 0 ? fortune : undefined,
		});
	}

	if (options.mooshroom) {
		const mushroom = result[Crop.Mushroom];
		const mooshroom = mushroom.otherCollection['Mushroom'] ?? 0;

		mushroom.collection += mooshroom;
		mushroom.otherCollection['Mooshroom'] = mooshroom;
		delete mushroom.otherCollection['Mushroom'];
	}

	return result;
}

function overbloomEffect(value: number, source = 'Overbloom'): Effect {
	return {
		source,
		op: 'add-rare-pct',
		value,
		scope: { tags: ['overbloom'] },
		relatedStats: [Stat.Overbloom],
	};
}

function wartyBugEffect(level = 10): Effect {
	return {
		source: 'Warty Bug Shard',
		op: 'add-drop',
		scope: { crops: [Crop.NetherWart] },
		drop: {
			itemId: 'WARTY',
			chance: 0.00005 * level,
			dropKind: 'rare',
			tags: ['overbloom', 'rare-crop'],
		},
	};
}

function cropeetleEffect(level = 10): Effect {
	return {
		source: 'Cropeetle Shard',
		op: 'mul-rare',
		value: 1 + 0.02 * level,
		scope: { tags: ['special-crop'] },
		relatedStats: [Stat.Overbloom],
	};
}

test('Rate calc test', () => {
	const drops = averageDetailed({
		blocksBroken: 24_000,
		farmingFortune: 100,
		bountiful: true,
		mooshroom: true,
	});

	expect(drops[Crop.Wheat].collection).toBe(48_000);
	expect(drops[Crop.Wheat].npcPrice).toBe(6);

	expect(drops[Crop.NetherWart].otherCollection['Fermento']).toBeCloseTo(1.68, 8);
	expect(drops[Crop.SugarCane].otherCollection['Fermento']).toBeCloseTo(1.68, 8);
	expect(drops[Crop.Cactus].otherCollection['Fermento']).toBeCloseTo(1.68, 8);

	expect(drops[Crop.Carrot].items[Crop.Carrot]).toBe(drops[Crop.Carrot].collection - 24000);
	expect(drops[Crop.Carrot].items).toStrictEqual({
		[Crop.Carrot]: 120000,
		CROPIE: 12,
		MUSHROOM_COLLECTION: 24000,
	});

	expect(drops[Crop.Melon].items[Crop.Melon]).toBe(240000);
	expect(drops[Crop.Melon].items.SQUASH).toBeCloseTo(7.2, 8);
	expect(drops[Crop.Melon].items.MUSHROOM_COLLECTION).toBe(24000);

	expect(drops[Crop.SugarCane].items).toStrictEqual({
		[Crop.SugarCane]: 96000,
		FERMENTO: 1.68,
		MUSHROOM_COLLECTION: 48000,
	});

	expect(drops[Crop.Seeds].items).toStrictEqual({
		[Crop.Seeds]: 48000,
		FERMENTO: 1.68,
		MUSHROOM_COLLECTION: 24000,
	});
	expect(drops[Crop.Seeds].otherCollection['Replenish']).toBe(-24000);
	expect(drops[Crop.Seeds].collection).toBe(48000 + 24000);

	expect(drops[Crop.Wheat].items).toStrictEqual({
		[Crop.Wheat]: 48000,
		[Crop.Seeds]: 48000,
		CROPIE: 12,
		MUSHROOM_COLLECTION: 24000,
	});
});

test('Possible results - Wheat', () => {
	const result = getPossibleResultsFromCrops(Crop.Wheat, 26000);

	expect(result[Crop.Wheat].items).toBe(26000);
	expect(result[Crop.Wheat].cost).toBe(0);
	expect(result[Crop.Wheat].remainder).toBe(0);

	expect(result['ENCHANTED_WHEAT'].fractionalItems).toBe(162.5);
	expect(result['ENCHANTED_WHEAT'].cost).toBe(0);
	expect(result['ENCHANTED_HAY_BALE'].fractionalItems).toBe(1.015625);
});

test('Possible results - Carrot', () => {
	const result = getPossibleResultsFromCrops(Crop.Carrot, 26000);

	expect(result[Crop.Carrot].items).toBe(26000);
	expect(result[Crop.Carrot].cost).toBe(0);
	expect(result[Crop.Carrot].remainder).toBe(0);

	expect(result['ENCHANTED_CARROT'].fractionalItems).toBe(162.5);
	expect(result['ENCHANTED_CARROT'].fractionalCost).toBe(0);
	expect(result['ENCHANTED_GOLDEN_CARROT'].fractionalItems).toBe(1.015625);
	expect(result['ENCHANTED_GOLDEN_CARROT'].fractionalCost).toBe(0);
});

test('Max fortune results', () => {
	const result = detailed({
		crop: Crop.Wheat,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: true,
	});

	expect(result.fortune).toBe(MAX_CROP_FORTUNE[Crop.Wheat]);

	const result2 = detailed({
		crop: Crop.Wheat,
		blocksBroken: 100_000,
		farmingFortune: 173,
		bountiful: true,
		mooshroom: true,
	});

	expect(result2.fortune).toBe(173);
});

test('Tool Exp Capsules include seeds for wheat', () => {
	const result = detailed({
		crop: Crop.Wheat,
		blocksBroken: 50_000,
		farmingFortune: 100,
		bountiful: true,
		mooshroom: false,
		maxTool: true,
	});

	// With 100 farming fortune: wheat collection = 100k, seeds (merged) = 100k.
	// Capsules are based on (wheat collection + seeds) / 200k => 1 capsule.
	expect(result.otherCollection['Seeds']).toBe(100_000);
	expect(result.items[Crop.Seeds]).toBe(100_000);

	expect(result.items['TOOL_EXP_CAPSULE']).toBe(1);
	expect(result.otherCollection['Tool Exp Capsule']).toBe(1);
	expect(result.coinSources['Tool Exp Capsule']).toBe(100_000);
});

test('Tool Exp Capsules include seeds for wheat (average drops)', () => {
	const drops = averageDetailed({
		blocksBroken: 50_000,
		farmingFortune: 100,
		bountiful: true,
		mooshroom: false,
		maxTool: true,
	});

	expect(drops[Crop.Wheat].otherCollection['Seeds']).toBe(100_000);
	expect(drops[Crop.Wheat].items['TOOL_EXP_CAPSULE']).toBe(1);
});

test('Warty RNG Drops', () => {
	const result = detailed({
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: true,
		effects: [wartyBugEffect()],
	});

	expect(result.fortune).toBe(MAX_CROP_FORTUNE[Crop.NetherWart]);
	expect(result.rngItems?.['WARTY']).toBe(50);
});

test('Burrowing RNG Drops', () => {
	const result = detailed({
		crop: Crop.Mushroom,
		bountiful: true,
		mooshroom: true,
		blocksBroken: 350_000,
	});

	expect(result.rngItems?.['BURROWING_SPORES']).toBe(1);
});

test('Cropeetle shard contributes a scoped special crop effect', () => {
	const resultWithShard = detailed({
		crop: Crop.Wheat,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		effects: [cropeetleEffect()],
	});

	const resultWithoutShard = detailed({
		crop: Crop.Wheat,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
	});

	expect(resultWithShard.effectsBreakdown).toStrictEqual({});
	expect(resultWithoutShard.effectsBreakdown).toStrictEqual({});
	expect(resultWithShard.items['CROPIE']).toBeCloseTo(resultWithoutShard.items['CROPIE'] * 1.2, 1);
	expect(resultWithShard.appliedEffects['CROPIE']).toContainEqual(
		expect.objectContaining({
			source: 'Cropeetle Shard',
			op: 'mul-rare',
			amount: 1.2,
		})
	);
});

test('Special crop RNG drops preserve fractional expected precision', () => {
	const result = detailed({
		crop: Crop.Wheat,
		blocksBroken: 12_345,
		bountiful: true,
		mooshroom: false,
		armorPieces: 4,
	});

	const expectedCropie = 12_345 * 0.0005;
	expect(result.items['CROPIE']).toBe(expectedCropie);
	expect(result.otherCollection.Cropie).toBe(expectedCropie);
	expect(result.coinSources.Cropie).toBe(expectedCropie * 25_000);
	expect(result.items['CROPIE']).not.toBe(+expectedCropie.toFixed(2));
});

test('Non-provided effects do not change added Warty drops', () => {
	const result = detailed({
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		effects: [wartyBugEffect()],
	});

	expect(result.specialCropBonus).toBe(0);
	expect(result.effectsBreakdown).toStrictEqual({});
	expect(result.rngItems?.['WARTY']).toBeCloseTo(50, 2);
});

test('Overbloom increases rare crops and rare item drops', () => {
	const baseResult = detailed({
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		effects: [wartyBugEffect()],
	});

	const overbloomResult = detailed({
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		effects: [wartyBugEffect(), overbloomEffect(5)],
	});

	expect(overbloomResult.effectsBreakdown).toStrictEqual({
		Overbloom: 5,
	});
	expect(overbloomResult.rngItems?.['WARTY']).toBeCloseTo(50 * 1.05, 2);
	expect(overbloomResult.items['FERMENTO']).toBeCloseTo((baseResult.items['FERMENTO'] ?? 0) * 1.05, 2);

	const baseMoonflower = detailed({
		crop: Crop.Moonflower,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
	});

	const moonflowerWithOverbloom = detailed({
		crop: Crop.Moonflower,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		effects: [overbloomEffect(5)],
	});

	expect(moonflowerWithOverbloom.effectsBreakdown.Overbloom).toBe(5);
	expect(moonflowerWithOverbloom.items['HELIANTHUS']).toBeCloseTo(
		(baseMoonflower.items['HELIANTHUS'] ?? 0) * 1.05,
		2
	);
});

test('Multiple additive rare effects stack correctly', () => {
	const result = detailed({
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		effects: [wartyBugEffect(), overbloomEffect(20, 'Natural Talent'), overbloomEffect(77.5, 'Sunset')],
	});

	expect(result.effectsBreakdown).toStrictEqual({
		'Natural Talent': 20,
		Sunset: 77.5,
	});
	expect(result.rngItems?.['WARTY']).toBeCloseTo(50 * 1.975, 1);
});

test('Melon NPC total matches the visible coin breakdown when rare effects are active', () => {
	const result = detailed({
		crop: Crop.Melon,
		blocksBroken: 72_000,
		farmingFortune: 100,
		bountiful: true,
		mooshroom: false,
		armorPieces: 4,
		effects: [overbloomEffect(20)],
	});

	const visibleTotal = Object.values(result.coinSources).reduce((sum, value) => sum + value, 0);

	expect(result.coinSources.Squash).toBeCloseTo(1_944_000, 5);
	expect(result.npcCoins).toBe(visibleTotal);
});

test('Average melon drops keep NPC total in sync with the visible coin breakdown', () => {
	const result = averageDetailed({
		blocksBroken: 72_000,
		farmingFortune: 100,
		bountiful: true,
		mooshroom: false,
		armorPieces: 4,
		effects: [overbloomEffect(20)],
	})[Crop.Melon];

	const visibleTotal = Object.values(result.coinSources).reduce((sum, value) => sum + value, 0);

	expect(result.coinSources.Squash).toBeCloseTo(1_944_000, 5);
	expect(result.npcCoins).toBe(visibleTotal);
});

test('Absent effects leave results unchanged', () => {
	const resultWithIdentityEffect = detailed({
		crop: Crop.Wheat,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
		effects: [cropeetleEffect(0)],
	});

	const resultWithoutModifiers = detailed({
		crop: Crop.Wheat,
		blocksBroken: 100_000,
		bountiful: true,
		mooshroom: false,
	});

	expect(resultWithIdentityEffect.specialCropBonus).toBe(0);
	expect(resultWithIdentityEffect.effectsBreakdown).toStrictEqual({});
	expect(resultWithIdentityEffect.items['CROPIE']).toBe(resultWithoutModifiers.items['CROPIE']);
});
