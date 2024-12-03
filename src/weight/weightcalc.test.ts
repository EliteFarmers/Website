import { expect, test } from 'vitest';
import { createFarmingWeightCalculator } from './weightcalc.js';
import { Crop } from '../constants/crops.js';
import { CROP_WEIGHT } from '../constants/weight.js';
import { uncountedCropsFromPests } from '../util/pests.js';
import { createFarmingPlayer } from '../player/player.js';

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

test('Basic player weight calculation', () => {
	const player = createFarmingPlayer({
		collection: crops,
	});

	expect(player.getWeightCalc().getWeightInfo().totalWeight).toBeCloseTo(170);
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

	expect(uncountedWheat).toBe(0);
	expect(uncountedWart).toBeCloseTo(30742);

	const weightExpected = createFarmingWeightCalculator({
		collection: {
			...crops,
			[Crop.Wheat]: crops[Crop.Wheat] - uncountedWheat,
			[Crop.NetherWart]: crops[Crop.NetherWart] - uncountedWart,
		},
	});

	expect(weight.getWeightInfo().cropWeight).toBeCloseTo(weightExpected.getWeightInfo().cropWeight);
});

test('Contest medals calculation', () => {
	const rawContests = {
		'350:12_9:POTATO_ITEM': {
			collected: 1290423,
			claimed_medal: 'diamond',
			claimed_participants: 1472,
			claimed_position: 19,
			claimed_rewards: true,
		},
		'350:12_9:WHEAT': { collected: 19440 },
		'351:4_17:WHEAT': {
			collected: 77695,
			claimed_medal: 'silver',
			claimed_participants: 2255,
			claimed_position: 525,
			claimed_rewards: true,
		},
		'351:4_17:MUSHROOM_COLLECTION': { collected: 507 },
		'351:7_20:SUGAR_CANE': {
			collected: 22883,
			claimed_medal: 'bronze',
			claimed_participants: 1152,
			claimed_position: 467,
			claimed_rewards: true,
		},
		'352:4_11:MUSHROOM_COLLECTION': { collected: 62 },
		'352:4_17:INK_SACK:3': {
			collected: 44502,
			claimed_medal: 'silver',
			claimed_participants: 988,
			claimed_position: 225,
			claimed_rewards: true,
		},
		'352:4_17:MUSHROOM_COLLECTION': { collected: 5608 },
		'352:4_17:SUGAR_CANE': { collected: 2240 },
		'352:4_26:WHEAT': {
			collected: 358095,
			claimed_medal: 'platinum',
			claimed_participants: 1349,
			claimed_position: 49,
			claimed_rewards: true,
		},
	};

	const weight = createFarmingWeightCalculator({
		collection: crops,
		pests: pests,
		farmingXp: 286958923.31966937,
		levelCapUpgrade: 10,
		anitaBonusFarmingFortuneLevel: 15,
		contests: Object.values(rawContests),
	});

	const bonus = weight.getBonusWeights();

	expect(weight.earnedMedals.diamond).toBe(1);
	expect(weight.earnedMedals.platinum).toBe(1);
	expect(bonus['Contest Medals']).toBe(0.75 + 0.5);
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

	const info = {
		collection: crops,
		pests: pests,
		farmingXp: 286958923.31966937,
		levelCapUpgrade: 10,
		anitaBonusFarmingFortuneLevel: 15,
		minions: minions,
	};

	const weight = createFarmingWeightCalculator(info)
		.setEarnedMedals({
			diamond: 246,
			platinum: 75,
			gold: 99,
		});

	expect(weight.getWeightInfo().totalWeight).toBeCloseTo(5217.48);

	const player = createFarmingPlayer({ ...info, bestiaryKills: pests });
	const playerWeight = player.getWeightCalc({ 
		minions, 
		levelCapUpgrade: 10,
		anitaBonusFarmingFortuneLevel: 15,
	}).setEarnedMedals({
		diamond: 246,
		platinum: 75,
		gold: 99,
	});

	expect(playerWeight.getCropWeights()).toStrictEqual(weight.getCropWeights());
	expect(playerWeight.getBonusWeights()).toStrictEqual(weight.getBonusWeights());
	expect(playerWeight.getWeightInfo().uncountedCrops).toStrictEqual(weight.getWeightInfo().uncountedCrops);

	expect(playerWeight.getWeightInfo().cropWeight).toBe(weight.getWeightInfo().cropWeight);
	expect(playerWeight.getWeightInfo().totalWeight).toBeCloseTo(weight.getWeightInfo().totalWeight);
});
