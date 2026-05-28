import { expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { Pest } from '../constants/pests.js';
import { Stat } from '../constants/stats.js';
import { PestFarmingPhase, PestFarmingPlayer } from '../player/pestfarmingplayer.js';
import { calculatePestCropDropAmount, PEST_DROP_DEFINITIONS } from './pest-drops.js';
import { DEFAULT_PEST_CYCLE_SETTINGS, PestFarmingRateCalculator } from './pest-farming-rate-calculator.js';
import type { PestCycleSettings, PestRatePriceBook } from './pest-rate-types.js';

test('pest crop drops use farming, associated crop, and pest kill fortune through scaling', () => {
	expect(
		calculatePestCropDropAmount({
			baseAmount: 1,
			scalingFortune: 35,
			farmingFortune: 1_000,
			cropFortune: 500,
			pestKillFortune: 1_000,
		})
	).toBeCloseTo(1 + 2500 / 35, 8);
});

test('bonus pest chance controls expected pests per spawn', () => {
	const player = new PestFarmingPlayer({});
	const calculator = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
		},
	});

	const result = calculator.calculate();

	expect(result.breakdown.pestSpawning.expectedPestsPerSpawn).toBe(1);
	expect(result.debug.cycleSeconds).toBeGreaterThan(0);
	expect(result.perInterval.npcCoins).toBeGreaterThan(0);
});

test('spawn phase bonus pest chance upgrades report positive pest rate impact', () => {
	const player = new PestFarmingPlayer({
		wrigglingLarva: 0,
	});
	const upgrade = player
		.getPhaseUpgrades(PestFarmingPhase.Spawn, { stat: Stat.BonusPestChance })
		.find((entry) => entry.title === 'Wriggling Larva');
	expect(upgrade).toBeDefined();

	const calculator = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
		},
		priceBook: {
			version: 'test',
			items: {
				ENCHANTED_WHEAT: { coins: 960, source: 'manual' },
			},
			missingItemMode: 'zero',
		},
	});

	const impact = calculator.calculateUpgradeImpact({
		phase: PestFarmingPhase.Spawn,
		upgrade: upgrade!,
		before: calculator.calculate(),
	});

	expect(impact.delta.expectedPestsPerCycle).toBeGreaterThan(0);
	expect(impact.valuationDelta.coinsPerHour).toBeGreaterThan(0);
});

const SHEET_INTERVAL_SECONDS = 3600;
const SHEET_BLOCKS_PER_SECOND = 19.8;
const SHEET_COOLDOWN_SECONDS = 135;
const SHEET_KILL_DOWNTIME_SECONDS = 20;
const SHEET_SPAWN_WAIT_SECONDS = 250 / SHEET_BLOCKS_PER_SECOND;
const SHEET_CYCLE_SECONDS = SHEET_COOLDOWN_SECONDS + SHEET_SPAWN_WAIT_SECONDS;
const SHEET_CYCLES_PER_HOUR = SHEET_INTERVAL_SECONDS / SHEET_CYCLE_SECONDS;
const SHEET_PESTS_PER_INTERVAL = 146.4373589;
const SHEET_FARM_BLOCKS_PER_CYCLE = (SHEET_COOLDOWN_SECONDS - SHEET_KILL_DOWNTIME_SECONDS) * SHEET_BLOCKS_PER_SECOND;
const SHEET_SPAWN_BLOCKS_PER_CYCLE = 250;
const SHEET_CROP_BLOCKS_PER_INTERVAL =
	(SHEET_FARM_BLOCKS_PER_CYCLE + SHEET_SPAWN_BLOCKS_PER_CYCLE) * SHEET_CYCLES_PER_HOUR;
const SHEET_CROP_ITEM_ID = 'SHEET_DEFAULT_FARMING_CROP';

const SHEET_BUCKETS = {
	pestDrops: 21_197_872.07,
	cropBreaking: 26_930_389.64,
	pestExchanges: 832_681.5646,
	pestShards: 480_064.2704,
	sprayonatorCost: -25_168.4,
	stinkyCheeseCost: 0,
	feastRareCrops: 0,
	total: 49_415_839.14,
};

const SHEET_PEST_AVG_COINS: Partial<Record<Pest, number>> = {
	[Pest.Beetle]: 145_987.0571,
	[Pest.Cricket]: 113_823.3777,
	[Pest.Worm]: 112_087.2598,
	[Pest.Fly]: 73_241.69788,
	[Pest.Locust]: 113_244.8234,
	[Pest.Mite]: 94_174.7724,
	[Pest.Mosquito]: 92_606.56851,
	[Pest.Moth]: 106_350.8587,
	[Pest.Rat]: 112_880.9626,
	[Pest.Slug]: 165_743.063,
	[Pest.Dragonfly]: 123_874.1456,
	[Pest.Firefly]: 96_189.50379,
	[Pest.Mantis]: 95_206.72017,
};

const SHEET_CROP_FORTUNE: Partial<Record<Crop, number>> = {
	[Crop.Cactus]: 2764.963740182875,
	[Crop.Carrot]: 2755.201061276125,
	[Crop.CocoaBeans]: 2780.2002800261253,
	[Crop.Melon]: 2743.201436276125,
	[Crop.Mushroom]: 2755.201061276125,
	[Crop.NetherWart]: 2755.201061276125,
	[Crop.Potato]: 2743.201436276125,
	[Crop.Pumpkin]: 2755.201061276125,
	[Crop.SugarCane]: 2752.964115182875,
	[Crop.Wheat]: 2755.201061276125,
	[Crop.Sunflower]: 2743.201436276125,
	[Crop.Moonflower]: 2743.201436276125,
	[Crop.WildRose]: 2755.201061276125,
};

const sheetCycleSettings: PestCycleSettings = {
	blocksPerSecond: SHEET_BLOCKS_PER_SECOND,
	spawnBlocksPerSecond: SHEET_BLOCKS_PER_SECOND,
	farmSwapBeforeCooldownSeconds: 0,
	farmToSpawnSwapSeconds: 0,
	spawnToKillSwapSeconds: 0,
	fixedKillSetupSeconds: SHEET_KILL_DOWNTIME_SECONDS,
	fixedPestSearchSeconds: 0,
	secondsPerPestKill: 0,
	returnToFarmSeconds: 0,
	activePestsAtCycleStart: 0,
	maxActivePests: 8,
	sprayedPlot: true,
	atmosphericFilterAutumn: false,
	pestRepellent: 'none',
	finneganActive: false,
};

test('matches the Skyblock Things Pest Farming default timing and cached top-level buckets', () => {
	const calculator = new PestFarmingRateCalculator({
		player: createSheetFixturePlayer(),
		options: {
			crop: Crop.Wheat,
			cycle: sheetCycleSettings,
			attraction: {
				pestTypeWeightMultipliers: {
					[Pest.Locust]: 12,
					[Pest.Slug]: 36,
					[Pest.Firefly]: 0,
				},
			},
			economy: {
				pestExchange: {
					outputItemId: 'PESTHUNTER_RELIC',
					pestsPerItem: 375,
					reservedPestsPerInterval: 80,
				},
				pestShards: {
					itemId: 'SHARD_PEST',
					chance: 0.026,
					fortune: 111,
				},
				sprayonatorCost: {
					itemId: 'PLANT_MATTER',
					durationSeconds: 1800,
				},
			},
			intervalSeconds: SHEET_INTERVAL_SECONDS,
		},
		priceBook: createSheetFixturePriceBook(),
	});

	const result = calculator.calculate();
	const pestDropCoins =
		result.valuation.byBucket.pestDrops + result.valuation.byBucket.rngDrops + result.valuation.byBucket.npcCoins;

	expect(result.debug.cooldownSeconds).toBeCloseTo(SHEET_COOLDOWN_SECONDS, 8);
	expect(result.debug.expectedSpawnWaitSeconds).toBeCloseTo(SHEET_SPAWN_WAIT_SECONDS, 8);
	expect(result.debug.cycleSeconds).toBeCloseTo(SHEET_CYCLE_SECONDS, 8);
	expect(result.debug.cyclesPerHour).toBeCloseTo(SHEET_CYCLES_PER_HOUR, 8);
	expect(result.debug.farmBlocks).toBeCloseTo(SHEET_FARM_BLOCKS_PER_CYCLE, 8);
	expect(result.debug.spawnBlocks).toBeCloseTo(SHEET_SPAWN_BLOCKS_PER_CYCLE, 8);
	expect(result.breakdown.pestSpawning.expectedPestsPerSpawn).toBeCloseTo(6.005, 8);
	expect(result.breakdown.pestSpawning.pestsPerInterval).toBeCloseTo(SHEET_PESTS_PER_INTERVAL, 6);
	expect(result.breakdown.pestSpawning.distribution.pestTypeProbabilities[Pest.Locust]).toBeCloseTo(12 / 58, 8);
	expect(result.breakdown.pestSpawning.distribution.pestTypeProbabilities[Pest.Slug]).toBeCloseTo(36 / 58, 8);
	expect(result.breakdown.pestSpawning.distribution.pestTypeProbabilities[Pest.Firefly]).toBe(0);

	expect(pestDropCoins).toBeCloseTo(SHEET_BUCKETS.pestDrops, 1);
	expect(result.valuation.byBucket.cropBreaking).toBeCloseTo(SHEET_BUCKETS.cropBreaking, 1);
	expect(result.valuation.byBucket.pestExchanges).toBeCloseTo(SHEET_BUCKETS.pestExchanges, 1);
	expect(result.valuation.byBucket.pestShards).toBeCloseTo(SHEET_BUCKETS.pestShards, 1);
	expect(result.valuation.byBucket.costs).toBeCloseTo(SHEET_BUCKETS.sprayonatorCost, 1);
	expect(result.valuation.byBucket.feastRareCrops).toBe(SHEET_BUCKETS.feastRareCrops);
	expect(result.valuation.coinsPerHour).toBeCloseTo(SHEET_BUCKETS.total, 1);
});

function createSheetFixturePlayer(): PestFarmingPlayer {
	const getRates = (_crop: Crop, blocks: number) => ({
		npcPrice: 0,
		collection: blocks,
		npcCoins: 0,
		fortune: 0,
		blocksBroken: blocks,
		coinSources: {},
		otherCollection: {},
		items: { [SHEET_CROP_ITEM_ID]: blocks },
		currencies: {},
		rngItems: {},
		specialCropBonus: 0,
		specialCropBonusBreakdown: {},
		appliedEffects: {},
		effectsBreakdown: {},
	});
	const kill = {
		getStatBreakdown: (stat: Stat, crop?: Crop) => ({
			'Sheet Fixture Crop Fortune': {
				value: crop ? (SHEET_CROP_FORTUNE[crop] ?? 0) : 0,
				stat,
			},
		}),
		buildEnvironment: () => ({}),
		collectEffects: () => [],
	};

	return {
		crop: { getRates },
		spawn: { getRates },
		kill,
		getPhaseStat: (phase: PestFarmingPhase, stat: Stat) => {
			if (phase === PestFarmingPhase.Farm && stat === Stat.PestCooldownReduction) return 55;
			if (phase === PestFarmingPhase.Spawn && stat === Stat.BonusPestChance) return 500.5;
			return 0;
		},
		phaseLoadouts: {},
		armorSetLoadouts: [],
		sharedEquipment: {},
		selectedVacuum: undefined,
	} as unknown as PestFarmingPlayer;
}

function createSheetFixturePriceBook(): PestRatePriceBook {
	const items: NonNullable<PestRatePriceBook['items']> = {
		[SHEET_CROP_ITEM_ID]: {
			coins: SHEET_BUCKETS.cropBreaking / SHEET_CROP_BLOCKS_PER_INTERVAL,
			source: 'manual',
		},
		PESTHUNTER_RELIC: {
			coins: (SHEET_BUCKETS.pestExchanges * 375) / (SHEET_PESTS_PER_INTERVAL - 80),
			source: 'manual',
		},
		SHARD_PEST: {
			coins: SHEET_BUCKETS.pestShards / (SHEET_PESTS_PER_INTERVAL * 0.026 * (1 + 111 / 100)),
			source: 'manual',
		},
		PLANT_MATTER: {
			coins: Math.abs(SHEET_BUCKETS.sprayonatorCost) / 2,
			source: 'manual',
		},
	};

	for (const [pest, definition] of Object.entries(PEST_DROP_DEFINITIONS) as [
		Pest,
		(typeof PEST_DROP_DEFINITIONS)[Pest],
	][]) {
		const averageCoins = SHEET_PEST_AVG_COINS[pest];
		if (!averageCoins) continue;
		const pestCoinDrops = definition.coinDrops ?? 0;
		const guaranteedAmount = definition.guaranteedDrops.reduce((sum, drop) => {
			return (
				sum +
				calculatePestCropDropAmount({
					baseAmount: drop.baseAmount,
					scalingFortune: drop.scalingFortune,
					farmingFortune: 0,
					cropFortune: SHEET_CROP_FORTUNE[drop.crop] ?? 0,
					pestKillFortune: 0,
					includeCropFortune: definition.pest !== Pest.Mouse,
				}) *
					(drop.chance ?? 1)
			);
		}, 0);
		const pricedRareDrops = (definition.rareDrops ?? []).reduce((sum, drop) => {
			const price = drop.itemId === 'PLANT_MATTER' ? (items.PLANT_MATTER?.coins ?? 0) : 0;
			return sum + price * drop.amount * drop.chance;
		}, 0);
		const price = (averageCoins - pestCoinDrops - pricedRareDrops) / guaranteedAmount;
		for (const drop of definition.guaranteedDrops) {
			items[drop.itemId] = { coins: price, source: 'manual' };
		}
	}

	return {
		version: 'skyblock-things-pest-farming-defaults',
		items,
		missingItemMode: 'zero',
	};
}
