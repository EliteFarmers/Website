import { describe, expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { Stat } from '../constants/stats.js';
import { FarmingPlayer } from '../player/player.js';

describe('ratecalc-effects: regression', () => {
	test('Harvest Feast Seasoning is reported as unpriced currency output', () => {
		const activeFeast = new FarmingPlayer({
			harvestFeast: {
				active: true,
				inSeasonCrops: [Crop.NetherWart],
			},
		});
		const inactiveFeast = new FarmingPlayer({});

		const blocksBroken = 225_000;
		const activeRates = activeFeast.getRates(Crop.NetherWart, blocksBroken);
		const inactiveRates = inactiveFeast.getRates(Crop.NetherWart, blocksBroken);

		expect(activeRates.currencies.SEASONING).toBeCloseTo(100, 8);
		expect(activeRates.rngItems?.SEASONING).toBeUndefined();
		expect(activeRates.coinSources.SEASONING).toBeUndefined();
		expect(activeRates.npcCoins).toBeCloseTo(inactiveRates.npcCoins, 8);
	});

	test('Deep Fried scales Seasoning currency without scaling Harvest Feast material items', () => {
		const baseTool = {
			id: 293,
			count: 1,
			skyblockId: 'THEORETICAL_HOE_WARTS_1',
			uuid: 'plain-wart-hoe',
			name: 'Newton Nether Warts Hoe',
			lore: ['LEGENDARY HOE'],
			enchantments: {},
			attributes: {},
		};
		const basePlayer = new FarmingPlayer({
			harvestFeast: {
				active: true,
				inSeasonCrops: [Crop.NetherWart],
			},
			tools: [baseTool],
		});
		const deepFriedPlayer = new FarmingPlayer({
			harvestFeast: {
				active: true,
				inSeasonCrops: [Crop.NetherWart],
			},
			tools: [
				{
					...baseTool,
					uuid: 'deep-fried-wart-hoe',
					attributes: { modifier: 'deep_fried' },
				},
			],
		});

		const blocksBroken = 225_000;
		const baseRates = basePlayer.getRates(Crop.NetherWart, blocksBroken);
		const deepFriedRates = deepFriedPlayer.getRates(Crop.NetherWart, blocksBroken);

		expect(deepFriedRates.currencies.SEASONING).toBeCloseTo(baseRates.currencies.SEASONING * 1.25, 8);
		expect(deepFriedRates.rngItems?.BOTROOT).toBeCloseTo(baseRates.rngItems?.BOTROOT ?? 0, 8);
	});

	test('Natural Talent increases Seasoning currency chance without scaling Harvest Feast material items', () => {
		const basePlayer = new FarmingPlayer({
			harvestFeast: {
				active: true,
				inSeasonCrops: [Crop.NetherWart],
			},
		});
		const naturalTalentPlayer = new FarmingPlayer({
			harvestFeast: {
				active: true,
				inSeasonCrops: [Crop.NetherWart],
				perks: { natural_talent: 5 },
			},
		});

		const blocksBroken = 225_000;
		const baseRates = basePlayer.getRates(Crop.NetherWart, blocksBroken);
		const naturalTalentRates = naturalTalentPlayer.getRates(Crop.NetherWart, blocksBroken);

		expect(naturalTalentPlayer.getStat(Stat.Overbloom)).toBe(0);
		expect(naturalTalentRates.currencies.SEASONING).toBeCloseTo(baseRates.currencies.SEASONING * 1.05, 8);
		expect(naturalTalentRates.rngItems?.BOTROOT).toBeCloseTo(baseRates.rngItems?.BOTROOT ?? 0, 8);
	});

	test('Cropeetle Shard scales matching special-crop drops by 1.20x', () => {
		const player = new FarmingPlayer({
			attributes: { crop_bug: 999 },
			tools: [
				{
					id: 1,
					count: 1,
					skyblockId: 'CACTUS_KNIFE',
					uuid: 'cactus-knife',
					name: '§aCactus Knife',
					lore: [],
					enchantments: {},
					attributes: {},
				},
			],
		});

		const baseline = new FarmingPlayer({
			tools: [
				{
					id: 1,
					count: 1,
					skyblockId: 'CACTUS_KNIFE',
					uuid: 'cactus-knife',
					name: '§aCactus Knife',
					lore: [],
					enchantments: {},
					attributes: {},
				},
			],
		});

		const cropeetleRates = player.getRates(Crop.Cactus, 100_000);
		const baselineRates = baseline.getRates(Crop.Cactus, 100_000);

		// Cactus matches SpecialCrop.Fermento. Cropeetle should scale FERMENTO drops.
		const fermentoBase = baselineRates.items['FERMENTO'] as number;
		const fermentoBuffed = cropeetleRates.items['FERMENTO'] as number;
		expect(fermentoBuffed).toBeCloseTo(fermentoBase * 1.2, 2);
	});

	test('Cropeetle Shard does NOT scale Warty drops on Nether Wart', () => {
		const player = new FarmingPlayer({
			attributes: { crop_bug: 999, wart_eater: 500 },
		});
		const baseline = new FarmingPlayer({ attributes: { wart_eater: 500 } });

		const buffed = player.getRates(Crop.NetherWart, 100_000);
		const base = baseline.getRates(Crop.NetherWart, 100_000);

		expect(buffed.rngItems?.['WARTY']).toBeCloseTo(base.rngItems?.['WARTY'] ?? 0, 4);
	});

	test('Warty Bug Shard only adds drops while farming Nether Wart', () => {
		const player = new FarmingPlayer({ attributes: { wart_eater: 500 } });

		expect(player.getRates(Crop.NetherWart, 100_000).rngItems?.['WARTY']).toBeGreaterThan(0);
		expect(player.getRates(Crop.Cactus, 100_000).rngItems?.['WARTY'] ?? 0).toBe(0);
		expect(player.getRates(Crop.Mushroom, 100_000).rngItems?.['WARTY'] ?? 0).toBe(0);
	});

	test('Blessed Reforge adds attributed crop collection without double-counting as RNG', () => {
		const player = new FarmingPlayer({
			tools: [
				{
					id: 293,
					count: 1,
					skyblockId: 'THEORETICAL_HOE_WARTS_1',
					uuid: 'blessed-wart-hoe',
					name: 'Blessed Newton Nether Warts Hoe',
					lore: [],
					enchantments: {},
					attributes: { modifier: 'blessed' },
				},
			],
		});

		const blocksBroken = 100_000;
		const rates = player.getRates(Crop.NetherWart, blocksBroken);
		const expectedBlessedDrops = blocksBroken * 0.0022 * 160;

		expect(rates.otherCollection['Blessed Reforge']).toBeCloseTo(expectedBlessedDrops, 8);
		expect(rates.coinSources['Blessed Reforge']).toBeCloseTo(expectedBlessedDrops * 4, 8);
		expect(rates.rngItems?.[Crop.NetherWart] ?? 0).toBe(0);
		expect(rates.items[Crop.NetherWart]).toBeCloseTo(
			rates.collection - blocksBroken,
			8
		);
	});

	test('Moonflower receives zero Overbloom from Sunset enchant', () => {
		const player = new FarmingPlayer({
			armor: [
				{
					id: 300,
					skyblockId: 'FERMENTO_LEGGINGS',
					uuid: 'sunset-leggings',
					name: '§6Fermento Leggings',
					lore: [],
					enchantments: { ultimate_sunset: 5 },
					attributes: {},
				},
			],
		});

		const moonflowerRates = player.getRates(Crop.Moonflower, 100_000);
		// No Sunset contribution should appear in the breakdown for Moonflower.
		expect(moonflowerRates.effectsBreakdown['Enchant: Sunset']).toBeUndefined();
	});

	test('Sunset enchant applies to non-Moonflower crops via effectsBreakdown', () => {
		const player = new FarmingPlayer({
			armor: [
				{
					id: 300,
					skyblockId: 'FERMENTO_LEGGINGS',
					uuid: 'sunset-leggings',
					name: '§6Fermento Leggings',
					lore: [],
					enchantments: { ultimate_sunset: 5 },
					attributes: {},
				},
			],
			attributes: { wart_eater: 500 },
		});

		const rates = player.getRates(Crop.NetherWart, 100_000);
		expect(rates.effectsBreakdown['Enchant: Sunset']).toBe(5);
	});
});
