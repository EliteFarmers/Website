import { expect, test } from 'vitest';
import { ITEM_IDS } from '../../constants/itemids.js';
import { ComposterUpgrade } from './composter.js';
import { getComposterStats } from './progress.js';

test('Composter Progress', () => {
	const levels: Record<ComposterUpgrade, number> = {
		[ComposterUpgrade.CostReduction]: 5,
		[ComposterUpgrade.Speed]: 10,
		[ComposterUpgrade.FuelCap]: 15,
		[ComposterUpgrade.MultiDrop]: 2,
		[ComposterUpgrade.OrganicMatterCap]: 1,
	};

	const { progress, stats, costToMax } = getComposterStats(levels);

	expect(progress).toHaveLength(5);
	expect(stats).toStrictEqual({
		[ComposterUpgrade.CostReduction]: 0.05,
		[ComposterUpgrade.Speed]: 2,
		[ComposterUpgrade.FuelCap]: 550000,
		[ComposterUpgrade.MultiDrop]: 0.06,
		[ComposterUpgrade.OrganicMatterCap]: 60000,
	});

	const costReductionProgress = progress.find((p) => p.name.startsWith('Cost Reduction'));
	expect(costReductionProgress).toBeDefined();
	expect(costReductionProgress?.max).toBe(25);
	expect(costReductionProgress?.current).toBe(5);

	const costReductionUpgrade = costReductionProgress?.upgrades?.[0];
	expect(costReductionUpgrade).toBeDefined();
	expect(costReductionUpgrade?.title).toBe('Cost Reduction 6');
	expect(costReductionUpgrade?.cost).toStrictEqual({
		items: {
			[ITEM_IDS.MutantNetherWart]: 4,
		},
		copper: 350,
	});

	const speedProgress = progress.find((p) => p.name.startsWith('Composter Speed'));
	expect(speedProgress).toBeDefined();
	expect(speedProgress?.max).toBe(25);
	expect(speedProgress?.current).toBe(10);

	const speedUpgrade = speedProgress?.upgrades?.[0];
	expect(speedUpgrade).toBeDefined();
	expect(speedUpgrade?.title).toBe('Composter Speed 11');
	expect(speedUpgrade?.cost).toStrictEqual({
		items: {
			[ITEM_IDS.EnchantedHayBale]: 24,
			[ITEM_IDS.Cropie]: 32,
		},
		copper: 800,
	});
	expect(speedUpgrade?.increase).toBeCloseTo(0.2);

	const fuelCapProgress = progress.find((p) => p.name.startsWith('Fuel Cap'));
	expect(fuelCapProgress).toBeDefined();
	expect(fuelCapProgress?.max).toBe(25);
	expect(fuelCapProgress?.current).toBe(15);

	const fuelCapUpgrade = fuelCapProgress?.upgrades?.[0];
	expect(fuelCapUpgrade).toBeDefined();
	expect(fuelCapUpgrade?.title).toBe('Fuel Cap 16');
	expect(fuelCapUpgrade?.cost).toStrictEqual({
		items: {
			[ITEM_IDS.EnchantedMelonBlock]: 128,
			[ITEM_IDS.Squash]: 12,
		},
		copper: 1600,
	});

	const multiDropProgress = progress.find((p) => p.name.startsWith('Multi Drop'));
	expect(multiDropProgress).toBeDefined();
	expect(multiDropProgress?.max).toBe(25);
	expect(multiDropProgress?.current).toBe(2);

	const multiDropUpgrade = multiDropProgress?.upgrades?.[0];
	expect(multiDropUpgrade).toBeDefined();
	expect(multiDropUpgrade?.title).toBe('Multi Drop 3');
	expect(multiDropUpgrade?.cost).toStrictEqual({
		items: {
			[ITEM_IDS.EnchantedBakedPotato]: 2,
		},
		copper: 200,
	});

	const organicMatterCapProgress = progress.find((p) => p.name.startsWith('Organic Matter Cap'));
	expect(organicMatterCapProgress).toBeDefined();
	expect(organicMatterCapProgress?.max).toBe(25);
	expect(organicMatterCapProgress?.current).toBe(1);

	const organicMatterCapUpgrade = organicMatterCapProgress?.upgrades?.[0];
	expect(organicMatterCapUpgrade).toBeDefined();
	expect(organicMatterCapUpgrade?.title).toBe('Organic Matter Cap 2');
	expect(organicMatterCapUpgrade?.cost).toStrictEqual({
		items: {
			[ITEM_IDS.EnchantedCookie]: 3,
		},
		copper: 150,
	});

	const fuelCapToMax = costToMax[ComposterUpgrade.FuelCap];
	expect(fuelCapToMax).toStrictEqual({
		items: {
			[ITEM_IDS.EnchantedSugarCane]: 992,
			[ITEM_IDS.EnchantedMelonBlock]: 1472,
			[ITEM_IDS.CondensedFermento]: 25,
			[ITEM_IDS.Fermento]: 21,
			[ITEM_IDS.Squash]: 236,
		},
		copper: 26800,
	});
});
