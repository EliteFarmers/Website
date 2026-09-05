import { describe, expect, test } from 'vitest';
import {
	calculateComposter,
	COMPOSTER_FUELS,
	COMPOSTER_ORGANIC_MATTER_ITEMS,
	rankComposterMaterials,
} from './calculator.js';
import { ComposterUpgrade } from './composter.js';

const enchantedSeeds = COMPOSTER_ORGANIC_MATTER_ITEMS.find((item) => item.itemId === 'ENCHANTED_SEEDS')!;
const condensedHelianthus = COMPOSTER_ORGANIC_MATTER_ITEMS.find((item) => item.itemId === 'CONDENSED_HELIANTHUS')!;
const oilBarrel = COMPOSTER_FUELS.find((item) => item.itemId === 'OIL_BARREL')!;

describe('calculateComposter', () => {
	test('matches the documented base production rate', () => {
		const result = calculateComposter({
			organicMatter: enchantedSeeds,
			fuel: oilBarrel,
		});

		expect(result.secondsPerCycle).toBe(600);
		expect(result.compostPerHour).toBe(6);
		expect(result.organicMatterPerCycle).toBe(4_000);
		expect(result.fuelPerCycle).toBe(2_000);
		expect(result.organicMatterCapacity).toBe(40_000);
		expect(result.fuelCapacity).toBe(100_000);
		expect(result.unattendedHours).toBeCloseTo(40_000 / 24_000);
	});

	test('matches the documented max-upgrade rate and consumption', () => {
		const max = {
			[ComposterUpgrade.Speed]: 25,
			[ComposterUpgrade.MultiDrop]: 25,
			[ComposterUpgrade.FuelCap]: 25,
			[ComposterUpgrade.OrganicMatterCap]: 25,
			[ComposterUpgrade.CostReduction]: 25,
		};
		const result = calculateComposter({ upgradeLevels: max, organicMatter: condensedHelianthus, fuel: oilBarrel });

		expect(result.compostPerHour).toBe(63);
		expect(result.organicMatterPerHour).toBe(108_000);
		expect(result.fuelPerHour).toBe(54_000);
		expect(result.unattendedHours).toBe(5);
		expect(result.compostPerHour * result.unattendedHours).toBe(315);
	});

	test('calculates daily profit from generic prices', () => {
		const result = calculateComposter({
			organicMatter: enchantedSeeds,
			fuel: oilBarrel,
			organicMatterPrice: 400,
			fuelPrice: 25_000,
			compostPrice: 30_000,
		});

		expect(result.organicCostPerDay).toBe(1_440_000);
		expect(result.fuelCostPerDay).toBeCloseTo(720_000);
		expect(result.revenuePerDay).toBe(4_320_000);
		expect(result.profitPerDay).toBeCloseTo(2_160_000);
	});

	test('clamps invalid upgrade levels to the supported range', () => {
		const result = calculateComposter({
			upgradeLevels: {
				[ComposterUpgrade.Speed]: 99,
				[ComposterUpgrade.MultiDrop]: -3,
			},
			organicMatter: enchantedSeeds,
			fuel: oilBarrel,
		});

		expect(result.upgradeLevels[ComposterUpgrade.Speed]).toBe(25);
		expect(result.upgradeLevels[ComposterUpgrade.MultiDrop]).toBe(0);
	});
});

describe('rankComposterMaterials', () => {
	test('orders valid prices by coins per organic matter and marks capacity limits', () => {
		const rankings = rankComposterMaterials(
			[
				{ itemId: 'SMALL', name: 'Small', value: 100 },
				{ itemId: 'LARGE', name: 'Large', value: 10_000 },
				{ itemId: 'MISSING', name: 'Missing', value: 100 },
			],
			{ SMALL: 50, LARGE: 1_000 },
			4_000,
			5_000
		);

		expect(rankings.map((item) => item.itemId)).toEqual(['LARGE', 'SMALL']);
		expect(rankings[0]?.costPerCycle).toBe(400);
		expect(rankings[0]?.fitsCapacity).toBe(false);
		expect(rankings[1]?.fitsCapacity).toBe(true);
	});

	test('uses fixed NPC prices when present', () => {
		const biofuel = COMPOSTER_FUELS.find((item) => item.itemId === 'BIOFUEL')!;
		const [ranked] = rankComposterMaterials([biofuel], {}, 2_000);

		expect(ranked?.unitPrice).toBe(20_000);
		expect(ranked?.coinsPerValue).toBeCloseTo(20 / 3);
	});
});
