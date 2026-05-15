import { describe, expect, test } from 'vitest';
import { Crop } from '../../constants/crops.js';
import { SpecialCrop } from '../../constants/specialcrops.js';
import { Stat } from '../../constants/stats.js';
import { buildEffectEnvironment } from '../../effects/environment.js';
import { produceAddedDrops, resolveDropEffects } from '../../effects/resolver.js';
import type { DropContext } from '../../effects/types.js';
import { createFarmingPlayer } from '../../player/player.js';
import {
	CropeetleShard,
	DragonflyShard,
	FARMING_ATTRIBUTE_SHARD_CLASSES,
	FireflyShard,
	GalaxyFishShard,
	LunarMothShard,
	PestShard,
	TermiteShard,
	WartyBugShard,
} from './attributes.js';

function dropCtx(overrides: Partial<DropContext>): DropContext {
	return {
		env: { harvestFeast: false, inSeason: false, infestedPlot: false },
		crop: Crop.Wheat,
		dropKind: 'rare',
		itemId: 'CROPIE',
		tags: new Set(),
		...overrides,
	};
}

describe('CropeetleShard', () => {
	test('emits no effect at level 0', () => {
		const player = createFarmingPlayer({ farmingLevel: 60 });
		const env = buildEffectEnvironment(player, Crop.Wheat);
		expect(new CropeetleShard().getEffects(player, env)).toEqual([]);
	});

	test('emits normal Overbloom at level 1', () => {
		// Cropeetle is Rarity.Rare; first threshold from ATTRIBUTE_SHARD_LEVELING is 1.
		const player = createFarmingPlayer({
			farmingLevel: 60,
			attributes: { crop_bug: 1 },
		});
		const env = buildEffectEnvironment(player, Crop.Wheat);
		const effects = new CropeetleShard().getEffects(player, env);
		expect(effects).toHaveLength(1);
		expect(effects[0]).toMatchObject({
			op: 'add-rare-pct',
			value: 1,
			scope: { tags: ['overbloom'] },
			relatedStats: [Stat.Overbloom],
			meta: {
				description: 'Normal Overbloom',
				valueDisplay: 'stat',
				valueStat: Stat.Overbloom,
			},
		});
	});

	test('buffs all normal Overbloom drops instead of only special crops', () => {
		const player = createFarmingPlayer({ farmingLevel: 60, attributes: { crop_bug: 1 } });
		const env = buildEffectEnvironment(player, Crop.Wheat);
		const effects = new CropeetleShard().getEffects(player, env);

		const cropie = dropCtx({
			itemId: 'CROPIE',
			dropKind: 'special-crop',
			specialCropType: SpecialCrop.Cropie,
			tags: new Set(['overbloom', 'rare-crop', 'special-crop']),
		});
		const seasoning = dropCtx({
			itemId: 'SEASONING',
			dropKind: 'rng',
			tags: new Set(['overbloom', 'rare-crop', 'seasoning', 'feast']),
		});
		const warty = dropCtx({
			crop: Crop.NetherWart,
			itemId: 'WARTY',
			dropKind: 'rare',
			tags: new Set(['overbloom', 'rare-crop']),
			fromAddDrop: true,
		});

		expect(resolveDropEffects(effects, cropie).addRarePct).toBe(1);
		expect(resolveDropEffects(effects, seasoning).addRarePct).toBe(1);
		expect(resolveDropEffects(effects, warty).addRarePct).toBe(1);
	});

	test('max level grants +10 normal Overbloom', () => {
		const player = createFarmingPlayer({
			farmingLevel: 60,
			attributes: { crop_bug: 999 },
		});
		const env = buildEffectEnvironment(player, Crop.Wheat);
		const effects = new CropeetleShard().getEffects(player, env);
		expect(effects[0]?.value).toBe(10);
	});
});

describe('WartyBugShard', () => {
	test('emits no effect off Nether Wart', () => {
		const player = createFarmingPlayer({
			farmingLevel: 60,
			attributes: { wart_eater: 1 },
		});
		const env = buildEffectEnvironment(player, Crop.Wheat);
		expect(new WartyBugShard().getEffects(player, env)).toEqual([]);
	});

	test('emits no effect at level 0', () => {
		const player = createFarmingPlayer({ farmingLevel: 60 });
		const env = buildEffectEnvironment(player, Crop.NetherWart);
		expect(new WartyBugShard().getEffects(player, env)).toEqual([]);
	});

	test('emits add-drop with chance 0.00005 per level on Nether Wart', () => {
		const player = createFarmingPlayer({
			farmingLevel: 60,
			attributes: { wart_eater: 1 },
		});
		const env = buildEffectEnvironment(player, Crop.NetherWart);
		const effects = new WartyBugShard().getEffects(player, env);
		expect(effects).toHaveLength(1);
		expect(effects[0]?.op).toBe('add-drop');
		expect(effects[0]?.drop?.itemId).toBe('WARTY');
		expect(effects[0]?.drop?.chance).toBeCloseTo(0.00005);
		expect(effects[0]?.drop?.tags).toEqual(['overbloom', 'rare-crop']);
		expect(effects[0]?.scope?.crops).toEqual([Crop.NetherWart]);
	});

	test('produceAddedDrops surfaces the Warty payload only on Nether Wart', () => {
		const player = createFarmingPlayer({ farmingLevel: 60, attributes: { wart_eater: 1 } });
		const wartEnv = buildEffectEnvironment(player, Crop.NetherWart);
		const wheatEnv = buildEffectEnvironment(player, Crop.Wheat);
		const wartEffects = new WartyBugShard().getEffects(player, wartEnv);
		const wheatEffects = new WartyBugShard().getEffects(player, wheatEnv);

		expect(produceAddedDrops(wartEffects, wartEnv)).toHaveLength(1);
		expect(produceAddedDrops(wartEffects, wheatEnv)).toHaveLength(0);
		expect(produceAddedDrops(wheatEffects, wheatEnv)).toHaveLength(0);
	});
});

describe('DragonflyShard', () => {
	test('+0.5 wisdom per level', () => {
		const player = createFarmingPlayer({ farmingLevel: 60, attributes: { garden_wisdom: 1 } });
		const env = buildEffectEnvironment(player);
		const effects = new DragonflyShard().getEffects(player, env);
		expect(effects).toHaveLength(1);
		expect(effects[0]?.op).toBe('add-stat');
		expect(effects[0]?.stat).toBe(Stat.FarmingWisdom);
		expect(effects[0]?.value).toBeCloseTo(0.5);
	});
});

describe('FireflyShard / LunarMothShard', () => {
	const both = { solar_power: 1, lunar_power: 1 };

	test('Firefly active by default; emits +5 fortune at level 1', () => {
		const player = createFarmingPlayer({ farmingLevel: 60, attributes: { solar_power: 1 } });
		const env = buildEffectEnvironment(player);
		const effects = new FireflyShard().getEffects(player, env);
		expect(effects).toHaveLength(1);
		expect(effects[0]?.value).toBe(5);
		expect(new FireflyShard().getActive!(player, env).active).toBe(true);
	});

	test('Firefly disabled when Moonflower selected', () => {
		const player = createFarmingPlayer({
			farmingLevel: 60,
			attributes: { solar_power: 1 },
			selectedCrop: Crop.Moonflower,
		});
		const env = buildEffectEnvironment(player);
		expect(new FireflyShard().getEffects(player, env)).toEqual([]);
		expect(new FireflyShard().getActive!(player, env).active).toBe(false);
	});

	test('Firefly forced active when Sunflower selected even if Lunar is higher', () => {
		const player = createFarmingPlayer({
			farmingLevel: 60,
			// Lunar level 2 (needs 1+1 = 2 shards), Firefly level 1
			attributes: { solar_power: 1, lunar_power: 2 },
			selectedCrop: Crop.Sunflower,
		});
		const env = buildEffectEnvironment(player);
		expect(new FireflyShard().getActive!(player, env).active).toBe(true);
		expect(new FireflyShard().getEffects(player, env)[0]?.value).toBe(5);
	});

	test('Firefly defers to Lunar when Lunar level is equal-or-higher', () => {
		const player = createFarmingPlayer({ farmingLevel: 60, attributes: both });
		const env = buildEffectEnvironment(player);
		// equal levels: Firefly defers
		expect(new FireflyShard().getActive!(player, env).active).toBe(false);
		expect(new LunarMothShard().getActive!(player, env).active).toBe(true);
		expect(new LunarMothShard().getEffects(player, env)[0]?.value).toBe(5);
	});
});

describe('TermiteShard', () => {
	test('inactive without infested plot', () => {
		const player = createFarmingPlayer({ farmingLevel: 60, attributes: { infiltration: 1 } });
		const env = buildEffectEnvironment(player);
		expect(new TermiteShard().getEffects(player, env)).toEqual([]);
		const state = new TermiteShard().getActive!(player, env);
		expect(state.active).toBe(false);
		expect(state.fortune).toBe(3);
	});

	test('active on infested plot; emits +3 fortune per level', () => {
		const player = createFarmingPlayer({
			farmingLevel: 60,
			attributes: { infiltration: 1 },
			infestedPlotProbability: 0.5,
		});
		const env = buildEffectEnvironment(player);
		expect(new TermiteShard().getActive!(player, env).active).toBe(true);
		expect(new TermiteShard().getEffects(player, env)[0]?.value).toBe(3);
	});
});

describe('GalaxyFishShard', () => {
	test('+1 fortune per level for farming/mining/foraging', () => {
		const player = createFarmingPlayer({ farmingLevel: 60, attributes: { ultimate_dna: 1 } });
		const env = buildEffectEnvironment(player);
		const effects = new GalaxyFishShard().getEffects(player, env);
		expect(effects).toHaveLength(3);
		expect(effects.map((e) => e.stat)).toEqual([Stat.FarmingFortune, Stat.MiningFortune, Stat.ForagingFortune]);
		for (const e of effects) expect(e.value).toBe(1);
	});
});

describe('PestShard', () => {
	test('emits pest-only Overbloom at level 1', () => {
		const player = createFarmingPlayer({ farmingLevel: 60, attributes: { pest_luck: 1 } });
		const env = buildEffectEnvironment(player);
		const effects = new PestShard().getEffects(player, env);

		expect(effects).toHaveLength(1);
		expect(effects[0]).toMatchObject({
			op: 'add-rare-pct',
			value: 2,
			scope: { tags: ['pest'] },
			relatedStats: [Stat.Overbloom],
			meta: {
				description: 'Pest Overbloom',
				valueDisplay: 'stat',
				valueStat: Stat.Overbloom,
			},
		});
	});

	test('only buffs pest drops and reaches +20 at max level', () => {
		const player = createFarmingPlayer({ farmingLevel: 60, attributes: { pest_luck: 999 } });
		const env = buildEffectEnvironment(player);
		const effects = new PestShard().getEffects(player, env);

		const pest = dropCtx({
			dropKind: 'pest',
			itemId: 'PEST_DROP',
			tags: new Set(['pest']),
		});
		const cropie = dropCtx({
			itemId: 'CROPIE',
			dropKind: 'special-crop',
			specialCropType: SpecialCrop.Cropie,
			tags: new Set(['overbloom', 'rare-crop', 'special-crop']),
		});

		expect(effects[0]?.value).toBe(20);
		expect(resolveDropEffects(effects, pest).addRarePct).toBe(20);
		expect(resolveDropEffects(effects, cropie).addRarePct).toBe(0);
	});
});

describe('FARMING_ATTRIBUTE_SHARD_CLASSES registry', () => {
	test('every legacy shard key has a class instance', () => {
		const expectedKeys = [
			'wart_eater',
			'garden_wisdom',
			'solar_power',
			'lunar_power',
			'pretty_clothes',
			'crop_bug',
			'fancy_visit',
			'infiltration',
			'insect_power',
			'pest_luck',
			'visitor_bait',
			'ultimate_dna',
		];
		for (const key of expectedKeys) {
			expect(FARMING_ATTRIBUTE_SHARD_CLASSES[key as keyof typeof FARMING_ATTRIBUTE_SHARD_CLASSES]).toBeDefined();
		}
	});

	test('cosmetic shards (effect: none) emit no effects', () => {
		const player = createFarmingPlayer({
			farmingLevel: 60,
			attributes: {
				pretty_clothes: 5,
				fancy_visit: 5,
				insect_power: 5,
				visitor_bait: 5,
			},
		});
		const env = buildEffectEnvironment(player);
		for (const key of ['pretty_clothes', 'fancy_visit', 'insect_power', 'visitor_bait'] as const) {
			expect(FARMING_ATTRIBUTE_SHARD_CLASSES[key].getEffects(player, env)).toEqual([]);
		}
	});
});
