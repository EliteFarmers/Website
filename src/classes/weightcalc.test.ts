import { expect, test } from 'vitest';
import { createFarmingWeightCalculator } from './weightcalc';
import { Crop } from '../constants/crops';
import { CROP_WEIGHT } from '../constants/weight';
import { uncountedCropsFromPests } from '../util/pests';

const crops = {
	[Crop.Cactus]: CROP_WEIGHT[Crop.Cactus] * 50,
	[Crop.Carrot]: CROP_WEIGHT[Crop.Carrot] * 10,
	[Crop.CocoaBeans]: CROP_WEIGHT[Crop.CocoaBeans] * 10,
	[Crop.Melon]: CROP_WEIGHT[Crop.Melon] * 10,
	[Crop.NetherWart]: CROP_WEIGHT[Crop.NetherWart] * 10,
	[Crop.Potato]: CROP_WEIGHT[Crop.Potato] * 10,
	[Crop.Pumpkin]: CROP_WEIGHT[Crop.Pumpkin] * 10,
	[Crop.SugarCane]: CROP_WEIGHT[Crop.SugarCane] * 50,
	[Crop.Wheat]: CROP_WEIGHT[Crop.Wheat] * 10,
};

const pests = {
	pest_fly_1: 150,
	pest_beetle_1: 86,
};

test('Basic weight calculation', () => {
	const weight = createFarmingWeightCalculator({
		collection: crops,
	});

	expect(weight.getWeightInfo().totalWeight).toBeCloseTo(170);
});

test('Mushroom weight calculation', () => {
	const weight = createFarmingWeightCalculator({
		collection: {
			...crops,
			[Crop.Mushroom]: CROP_WEIGHT[Crop.Mushroom] * 13.74,
		},
	});

	expect(weight.getWeightInfo().totalWeight).toBeCloseTo(180);
});

test('Pest debuff weight calculation', () => {
	const weight = createFarmingWeightCalculator({
		collection: crops,
		pests: pests,
	});

	const uncounted = uncountedCropsFromPests(pests);
	const uncountedWheat = uncounted[Crop.Wheat] ?? 0;
	const uncountedWart = uncounted[Crop.NetherWart] ?? 0;

	expect(weight.getWeightInfo().uncountedCrops[Crop.Wheat]).toBeCloseTo(uncountedWheat);
	expect(weight.getWeightInfo().uncountedCrops[Crop.NetherWart]).toBeCloseTo(uncountedWart);

	const weightExpected = createFarmingWeightCalculator({
		collection: {
			...crops,
			[Crop.Wheat]: crops[Crop.Wheat] - uncountedWheat,
			[Crop.NetherWart]: crops[Crop.NetherWart] - uncountedWart,
		},
	});

	expect(weight.getWeightInfo().cropWeight).toBeCloseTo(weightExpected.getWeightInfo().cropWeight);
});

test('Full weight calculation', () => {
	const crops = {
		[Crop.Cactus]: 1219395,
		[Crop.Carrot]: 14238991,
		[Crop.CocoaBeans]: 901826,
		[Crop.Melon]: 5041491,
		[Crop.Mushroom]: 9063168,
		[Crop.NetherWart]: 897212645,
		[Crop.Potato]: 171017100,
		[Crop.Pumpkin]: 1496477,
		[Crop.SugarCane]: 15509429,
		[Crop.Wheat]: 21996256,
	};

	const pests = {
		pest_fly_1: 222,
		pest_rat_1: 40,
		pest_mite_1: 43,
		pest_moth_1: 40,
		pest_slug_1: 34,
		pest_worm_1: 32,
		pest_beetle_1: 265,
		pest_locust_1: 41,
		pest_cricket_1: 36,
		pest_mosquito_1: 41,
	};

	const minions = [
		'WHEAT_11',
		'CARROT_11',
		'POTATO_12',
		'PUMPKIN_12',
		'MELON_12',
		'MUSHROOM_12',
		'COCOA_11',
		'CACTUS_11',
		'SUGAR_CANE_12',
		'NETHER_WARTS_12',
	];

	const weight = createFarmingWeightCalculator({
		collection: crops,
		pests: pests,
		farmingXp: 286958923.31966937,
		levelCapUpgrade: 10,
		anitaBonusFarmingFortuneLevel: 15,
		minions: minions,
	}).setEarnedMedals({
		diamond: 246,
		platinum: 75,
		gold: 99,
	});

	expect(weight.getWeightInfo().totalWeight).toBeCloseTo(5176.617);
});
