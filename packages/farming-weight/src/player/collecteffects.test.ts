import { describe, expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { Stat } from '../constants/stats.js';
import { resolveStatTotal } from '../effects/resolver.js';
import { FarmingPlayer } from './player.js';

describe('FarmingPlayer.collectEffects', () => {
	test('empty player produces an empty effect list', () => {
		const player = new FarmingPlayer({});
		const env = player.buildEnvironment();
		expect(player.collectEffects(env)).toEqual([]);
	});

	test('chips contribute add-stat effects matching legacy getStat totals', () => {
		const player = new FarmingPlayer({
			chips: {
				cropshot: 10,
				vermin_vaporizer: 7,
				sowledge: 4,
			},
		});
		const env = player.buildEnvironment();
		const effects = player.collectEffects(env);

		expect(effects.length).toBeGreaterThan(0);

		const ff = resolveStatTotal(effects, Stat.FarmingFortune, { env });
		const bpc = resolveStatTotal(effects, Stat.BonusPestChance, { env });
		const wisdom = resolveStatTotal(effects, Stat.FarmingWisdom, { env });

		expect(ff).toBe(30);
		expect(bpc).toBe(21);
		expect(wisdom).toBe(4);
	});

	test('rarefinder chip emits a global add-rare-pct overbloom effect', () => {
		const player = new FarmingPlayer({ chips: { rarefinder: 10 } });
		const env = player.buildEnvironment();
		const effects = player.collectEffects(env);

		const overbloomPct = effects.filter((e) => e.op === 'add-rare-pct' && e.relatedStats?.includes(Stat.Overbloom));
		expect(overbloomPct.length).toBe(1);
		expect(overbloomPct[0].scope).toEqual({ tags: ['overbloom'] });
		expect(typeof overbloomPct[0].value).toBe('number');
		expect(overbloomPct[0].value).toBeGreaterThan(0);
	});

	test('attribute shards contribute via getEffects', () => {
		// Cropeetle is Rare; total shards for max level 10 = 48. Use a high
		// number to guarantee max level -> +10 normal Overbloom.
		const player = new FarmingPlayer({
			attributes: { crop_bug: 999 },
		});
		const env = player.buildEnvironment();
		const effects = player.collectEffects(env);

		const cropeetle = effects.filter((e) => e.source === 'Cropeetle Shard');
		expect(cropeetle.length).toBe(1);
		expect(cropeetle[0].op).toBe('add-rare-pct');
		expect(cropeetle[0].value).toBe(10);
		expect(cropeetle[0].scope).toEqual({ tags: ['overbloom'] });
		expect(cropeetle[0].relatedStats).toContain(Stat.Overbloom);
	});

	test('firefly shard is suppressed when Moonflower is selected', () => {
		const player = new FarmingPlayer({
			attributes: { solar_power: 999 },
			selectedCrop: Crop.Moonflower,
		});
		const env = player.buildEnvironment();
		const effects = player.collectEffects(env);

		const ff = resolveStatTotal(effects, Stat.FarmingFortune, { env });
		expect(ff).toBe(0);
	});

	test('environment crop is plumbed through to env.crop', () => {
		const player = new FarmingPlayer({});
		const env = player.buildEnvironment(Crop.NetherWart);
		expect(env.crop).toBe(Crop.NetherWart);
	});
});
