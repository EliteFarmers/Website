import { describe, expect, test } from 'vitest';
import { Crop } from '../../constants/crops.js';
import { Stat } from '../../constants/stats.js';
import { resolveOverbloomScalar, resolveStatTotal } from '../../effects/resolver.js';
import { FarmingAccessory } from '../../fortune/farmingaccessory.js';
import { FARMING_ACCESSORIES_INFO } from '../../items/accessories.js';
import { FarmingPlayer } from '../../player/player.js';
import { collectCropFortuneSourceEffects, collectGeneralFortuneSourceEffects } from './effectsources.js';

describe('source-layer effect collection', () => {
	test('general sources emit stat effects without class-backed attribute/chip duplicates', () => {
		const player = new FarmingPlayer({
			farmingLevel: 60,
			anitaBonus: 3,
			chips: {
				cropshot: 10,
			},
			attributes: {
				ultimate_dna: 1,
			},
		});
		const env = player.buildEnvironment();
		const effects = collectGeneralFortuneSourceEffects(player);

		expect(resolveStatTotal(effects, Stat.FarmingFortune, { env })).toBe(240 + 12);
		expect(effects.some((effect) => effect.source === 'Attribute Shards')).toBe(false);
		expect(effects.some((effect) => effect.source === 'Cropshot Chip')).toBe(false);
	});

	test('general sources do not double count active accessory-backed sources', () => {
		const player = new FarmingPlayer({
			accessories: [
				FarmingAccessory.fakeItem(FARMING_ACCESSORIES_INFO.MAGIC_8_BALL!)!,
				FarmingAccessory.fakeItem(FARMING_ACCESSORIES_INFO.ATMOSPHERIC_FILTER!)!,
			],
		});

		expect(collectGeneralFortuneSourceEffects(player).some((effect) => effect.source === 'Magic 8 Ball')).toBe(
			false
		);
		expect(
			collectGeneralFortuneSourceEffects(player).some((effect) => effect.source === 'Atmospheric Filter')
		).toBe(false);
	});

	test('Natural Talent emits a Seasoning-only drop chance effect, not Overbloom', () => {
		const inactive = new FarmingPlayer({
			harvestFeast: {
				active: false,
				perks: { natural_talent: 5 },
			},
		});
		const active = new FarmingPlayer({
			harvestFeast: {
				active: true,
				perks: { natural_talent: 5 },
			},
		});

		const inactiveEnv = inactive.buildEnvironment(Crop.Wheat);
		const activeEnv = active.buildEnvironment(Crop.Wheat);
		const activeEffects = collectGeneralFortuneSourceEffects(active);

		expect(
			resolveOverbloomScalar(collectGeneralFortuneSourceEffects(inactive), { env: inactiveEnv }, Stat.Overbloom)
		).toBe(0);
		expect(resolveOverbloomScalar(activeEffects, { env: activeEnv }, Stat.Overbloom)).toBe(0);
		expect(activeEffects).toContainEqual(
			expect.objectContaining({
				source: 'Natural Talent',
				op: 'add-rare-pct',
				value: 5,
				scope: { tags: ['seasoning'], requiresHarvestFeast: true },
			})
		);
	});

	test('crop sources emit effects only for crop context', () => {
		const player = new FarmingPlayer({
			exportableCrops: {
				[Crop.Carrot]: true,
			},
			cropUpgrades: {
				[Crop.Carrot]: 2,
			},
			personalBestsUnlocked: true,
			personalBests: {
				CARROT_ITEM: 50_000,
			},
		});

		expect(collectCropFortuneSourceEffects(player, player.buildEnvironment())).toEqual([]);

		const env = player.buildEnvironment(Crop.Carrot);
		const effects = collectCropFortuneSourceEffects(player, env);

		expect(effects).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					source: 'Exportable Crop',
					op: 'add-stat',
					stat: Stat.CarrotFortune,
					value: 12,
				}),
				expect.objectContaining({
					source: 'Garden Crop Upgrade',
					op: 'add-stat',
					stat: Stat.CarrotFortune,
					value: 10,
				}),
			])
		);
	});
});
