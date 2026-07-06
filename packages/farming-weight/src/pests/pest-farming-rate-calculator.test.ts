import { expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { Pest, Spray } from '../constants/pests.js';
import { FarmingPets } from '../constants/pets.js';
import { Rarity } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import type { EliteItemDto } from '../fortune/item.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { GearSlot } from '../items/definitions.js';
import { PestFarmingPhase, PestFarmingPlayer } from '../player/pestfarmingplayer.js';
import type { DetailedDropsFromEffectsResult } from '../util/ratecalc-effects.js';
import { calculatePestCropDropAmount, PEST_DROP_DEFINITIONS } from './pest-drops.js';
import { DEFAULT_PEST_CYCLE_SETTINGS, PestFarmingRateCalculator } from './pest-farming-rate-calculator.js';
import type { PestCycleSettings, PestRatePriceBook } from './pest-rate-types.js';

function emptyCropRates(blocksBroken = 0): DetailedDropsFromEffectsResult {
	return {
		npcPrice: 0,
		collection: 0,
		npcCoins: 0,
		fortune: 0,
		blocksBroken,
		coinSources: {},
		otherCollection: {},
		items: {},
		currencies: {},
		rngItems: {},
		specialCropBonus: 0,
		specialCropBonusBreakdown: {},
		appliedEffects: {},
		effectsBreakdown: {},
	};
}

function armorItem(
	id: keyof typeof FARMING_ARMOR_INFO,
	uuid: string,
	attributes: NonNullable<EliteItemDto['attributes']> = {}
): EliteItemDto {
	const info = FARMING_ARMOR_INFO[id]!;
	return {
		name: info.name,
		skyblockId: info.skyblockId,
		uuid,
		lore: [],
		attributes: {
			rarity: Rarity.Legendary,
			...attributes,
		},
		enchantments: {},
		gems: {},
	};
}

function mantidArmor(id: keyof typeof FARMING_ARMOR_INFO, uuid: string): EliteItemDto {
	return armorItem(id, uuid, { modifier: 'mantid' });
}

function pestPlayerWithArmorSets(options: {
	main: [
		keyof typeof FARMING_ARMOR_INFO,
		keyof typeof FARMING_ARMOR_INFO,
		keyof typeof FARMING_ARMOR_INFO,
		keyof typeof FARMING_ARMOR_INFO,
	];
	spawn: [
		keyof typeof FARMING_ARMOR_INFO,
		keyof typeof FARMING_ARMOR_INFO,
		keyof typeof FARMING_ARMOR_INFO,
		keyof typeof FARMING_ARMOR_INFO,
	];
}): PestFarmingPlayer {
	const mainUuids = ['main-helmet', 'main-chestplate', 'main-leggings', 'main-boots'] as const;
	const spawnUuids = ['spawn-helmet', 'spawn-chestplate', 'spawn-leggings', 'spawn-boots'] as const;

	return new PestFarmingPlayer({
		armor: [
			armorItem(options.main[0], mainUuids[0]),
			armorItem(options.main[1], mainUuids[1]),
			armorItem(options.main[2], mainUuids[2]),
			armorItem(options.main[3], mainUuids[3]),
			armorItem(options.spawn[0], spawnUuids[0]),
			armorItem(options.spawn[1], spawnUuids[1]),
			armorItem(options.spawn[2], spawnUuids[2]),
			armorItem(options.spawn[3], spawnUuids[3]),
		],
		armorSets: [
			{
				id: 'main',
				name: 'Farm/Kill Armor',
				pieces: {
					[GearSlot.Helmet]: mainUuids[0],
					[GearSlot.Chestplate]: mainUuids[1],
					[GearSlot.Leggings]: mainUuids[2],
					[GearSlot.Boots]: mainUuids[3],
				},
			},
			{
				id: 'spawn',
				name: 'Spawn Armor',
				pieces: {
					[GearSlot.Helmet]: spawnUuids[0],
					[GearSlot.Chestplate]: spawnUuids[1],
					[GearSlot.Leggings]: spawnUuids[2],
					[GearSlot.Boots]: spawnUuids[3],
				},
			},
		],
	});
}

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

test('pest rate calculation uses each pest drop crop fortune even when farming another crop', () => {
	const cropFortunes: Partial<Record<Crop, number>> = {
		[Crop.Wheat]: 0,
		[Crop.Cactus]: 700,
	};
	const player = {
		crop: { getRates: (_crop: Crop, blocks: number) => emptyCropRates(blocks) },
		spawn: { getRates: (_crop: Crop, blocks: number) => emptyCropRates(blocks) },
		kill: {
			getStatBreakdown: (stat: Stat, crop?: Crop) => ({
				'Test Crop Fortune': {
					value: crop ? (cropFortunes[crop] ?? 0) : 0,
					stat,
				},
			}),
			buildEnvironment: () => ({}),
			collectEffects: () => [],
		},
		getPhaseStat: (phase: PestFarmingPhase, stat: Stat) => {
			if (phase === PestFarmingPhase.Kill && stat === Stat.FarmingFortune) return 100;
			if (phase === PestFarmingPhase.Kill && stat === Stat.PestKillFortune) return 300;
			return 0;
		},
	} as unknown as PestFarmingPlayer;
	const miteDrop = PEST_DROP_DEFINITIONS[Pest.Mite].guaranteedDrops[0]!;

	const result = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
			attraction: {
				excludedPests: Object.values(Pest).filter((pest) => pest !== Pest.Mite),
			},
		},
		priceBook: {
			version: 'test',
			items: {
				[miteDrop.itemId]: { coins: 1, source: 'manual' },
			},
			missingItemMode: 'zero',
		},
	}).calculate();
	const miteDrops = result.breakdown.pestDrops.byPest[Pest.Mite]!;
	const expectedMiteCropDrops =
		calculatePestCropDropAmount({
			baseAmount: miteDrop.baseAmount,
			scalingFortune: miteDrop.scalingFortune,
			farmingFortune: 100,
			cropFortune: 700,
			pestKillFortune: 300,
		}) * miteDrops.expectedPests;

	expect(result.phaseStats.associatedCropFortune[Crop.Wheat]).toBe(0);
	expect(result.phaseStats.associatedCropFortune[Crop.Cactus]).toBe(700);
	expect(miteDrops.items[miteDrop.itemId]).toBeCloseTo(expectedMiteCropDrops, 8);
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

test('selected crop does not bias pest type spawn weights', () => {
	const player = new PestFarmingPlayer({});
	const getProbabilities = (crop: Crop) =>
		new PestFarmingRateCalculator({
			player,
			options: {
				crop,
				cycle: DEFAULT_PEST_CYCLE_SETTINGS,
			},
		}).calculate().breakdown.pestSpawning.distribution.pestTypeProbabilities;

	expect(getProbabilities(Crop.Wheat)).toEqual(getProbabilities(Crop.Potato));
});

test('mosquito smooth jazz uses rarity breakpoints for vinyl attraction', () => {
	const getVinylTargetWeight = (selectedPet?: { type: FarmingPets; rarity?: Rarity; level?: number }) => {
		const getRates = (_crop: Crop, blocks: number) => emptyCropRates(blocks);
		const player = {
			crop: { getRates },
			spawn: { getRates, selectedPet },
			kill: {
				getStatBreakdown: () => ({}),
				buildEnvironment: () => ({}),
				collectEffects: () => [],
			},
			getPhaseStat: () => 0,
			phaseLoadouts: {},
			armorSetLoadouts: [],
			sharedEquipment: {},
			selectedVacuum: undefined,
		} as unknown as PestFarmingPlayer;

		return (
			new PestFarmingRateCalculator({
				player,
				options: {
					crop: Crop.Wheat,
					cycle: DEFAULT_PEST_CYCLE_SETTINGS,
					attraction: {
						hooveriusVinylTarget: Pest.Slug,
					},
				},
			}).calculate().breakdown.pestSpawning.distribution.pestTypeWeights[Pest.Slug] ?? 0
		);
	};
	const getMosquitoWeight = (rarity: Rarity) =>
		getVinylTargetWeight({
			type: FarmingPets.Mosquito,
			rarity,
			level: 100,
		});

	expect(getVinylTargetWeight()).toBeCloseTo(2, 8);
	expect(
		getVinylTargetWeight({
			type: FarmingPets.Slug,
			rarity: Rarity.Legendary,
			level: 100,
		})
	).toBeCloseTo(2, 8);
	expect(getMosquitoWeight(Rarity.Common)).toBeCloseTo(2.5, 8);
	expect(getMosquitoWeight(Rarity.Uncommon)).toBeCloseTo(2.5, 8);
	expect(getMosquitoWeight(Rarity.Rare)).toBeCloseTo(2.7, 8);
	expect(getMosquitoWeight(Rarity.Epic)).toBeCloseTo(3, 8);
	expect(getMosquitoWeight(Rarity.Legendary)).toBeCloseTo(3, 8);
});

test('best spawn phase armor set uses rate calculation to select the generated spawn set when it improves rates', () => {
	const player = pestPlayerWithArmorSets({
		main: ['FERMENTO_HELMET', 'FERMENTO_CHESTPLATE', 'FERMENTO_LEGGINGS', 'FERMENTO_BOOTS'],
		spawn: ['HELIANTHUS_HELMET', 'HELIANTHUS_CHESTPLATE', 'HELIANTHUS_LEGGINGS', 'HELIANTHUS_BOOTS'],
	});
	const calculator = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
		},
	});

	expect(calculator.getBestSpawnPhaseArmorSetId(['main', 'spawn'])).toBe('spawn');
});

test('best spawn phase armor set uses rate calculation to reuse main armor when the spawn set is worse', () => {
	const player = pestPlayerWithArmorSets({
		main: ['HELIANTHUS_HELMET', 'HELIANTHUS_CHESTPLATE', 'HELIANTHUS_LEGGINGS', 'HELIANTHUS_BOOTS'],
		spawn: ['CROPIE_HELMET', 'CROPIE_CHESTPLATE', 'CROPIE_LEGGINGS', 'CROPIE_BOOTS'],
	});
	const calculator = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
		},
	});

	expect(calculator.getBestSpawnPhaseArmorSetId(['main', 'spawn'])).toBe('main');
});

test('rate calculation can automatically use the best spawn armor candidate', () => {
	const player = pestPlayerWithArmorSets({
		main: ['HELIANTHUS_HELMET', 'HELIANTHUS_CHESTPLATE', 'HELIANTHUS_LEGGINGS', 'HELIANTHUS_BOOTS'],
		spawn: ['CROPIE_HELMET', 'CROPIE_CHESTPLATE', 'CROPIE_LEGGINGS', 'CROPIE_BOOTS'],
	});
	const rawSpawnBonusPestChance = player.getPhaseStat(PestFarmingPhase.Spawn, Stat.BonusPestChance);
	const mainSelected = player.clone();
	mainSelected.setPhaseArmorSet(PestFarmingPhase.Spawn, 'main');
	const mainSpawnBonusPestChance = mainSelected.getPhaseStat(PestFarmingPhase.Spawn, Stat.BonusPestChance);

	const result = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
		},
		armorSelection: {
			spawnArmorSetIds: ['main', 'spawn'],
		},
	}).calculate();

	expect(rawSpawnBonusPestChance).toBeLessThan(mainSpawnBonusPestChance);
	expect(result.phaseStats.spawnBonusPestChance).toBe(mainSpawnBonusPestChance);
});

test('pest rate calculation derives Mantid recent pest kills from expected spawned pests', () => {
	const player = new PestFarmingPlayer({
		armor: [
			mantidArmor('HELIANTHUS_HELMET', 'mantid-helmet'),
			mantidArmor('HELIANTHUS_CHESTPLATE', 'mantid-chestplate'),
			mantidArmor('HELIANTHUS_LEGGINGS', 'mantid-leggings'),
			mantidArmor('HELIANTHUS_BOOTS', 'mantid-boots'),
		],
	});
	const baseBonusPestChance = player.getPhaseStat(PestFarmingPhase.Spawn, Stat.BonusPestChance);
	const expectedResolvedBonusPestChance = (baseBonusPestChance + 1) / 0.99;
	const expectedPestsPerSpawn = 1 + expectedResolvedBonusPestChance / 100;

	const result = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
		},
	}).calculate();

	expect(player.options.mantidPestKills).toBeUndefined();
	expect(baseBonusPestChance).toBe(88);
	expect(result.phaseStats.spawnBonusPestChance).toBeGreaterThan(baseBonusPestChance);
	expect(result.phaseStats.spawnBonusPestChance).toBeCloseTo(expectedResolvedBonusPestChance, 6);
	expect(result.breakdown.pestSpawning.expectedPestsPerSpawn).toBeCloseTo(expectedPestsPerSpawn, 6);
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

test('upgrade impact completeness is based on missing delta prices', () => {
	const player = new PestFarmingPlayer({
		selectedCrop: Crop.Wheat,
	});
	const calculator = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
		},
		priceBook: {
			version: 'test',
			items: {},
			missingItemMode: 'exclude',
		},
	});
	const before = calculator.calculate();
	const noDeltaUpgrade = player
		.getPhaseUpgrades(PestFarmingPhase.Farm, { includeUpgradeGroups: true })
		.find((entry) => entry.title === 'Atmospheric Filter');
	const cropDeltaUpgrade = player
		.getPhaseUpgrades(PestFarmingPhase.Farm, { includeUpgradeGroups: true })
		.find((entry) => entry.title === 'Farm Armor Helmet');

	expect(before.valuation.complete).toBe(false);
	expect(noDeltaUpgrade).toBeDefined();
	expect(cropDeltaUpgrade).toBeDefined();

	const noDeltaImpact = calculator.calculateUpgradeImpact({
		phase: PestFarmingPhase.Farm,
		upgrade: noDeltaUpgrade!,
		before,
	});
	const cropDeltaImpact = calculator.calculateUpgradeImpact({
		phase: PestFarmingPhase.Farm,
		upgrade: cropDeltaUpgrade!,
		before,
	});

	expect(noDeltaImpact.valuationDelta.complete).toBe(true);
	expect(noDeltaImpact.valuationDelta.missingItemIds).toEqual([]);
	expect(cropDeltaImpact.valuationDelta.complete).toBe(false);
	expect(cropDeltaImpact.valuationDelta.missingItemIds).toContain(Crop.Wheat);
});

test('crop breaking does not double count crop item NPC valuation', () => {
	const bountifulCoinsPerPhase = 100;
	const fermentoPerPhase = 1;
	const cropRates = (blocks: number): DetailedDropsFromEffectsResult => ({
		...emptyCropRates(blocks),
		items: {
			[Crop.NetherWart]: blocks,
			FERMENTO: fermentoPerPhase,
		},
		npcCoins: blocks * 4 + bountifulCoinsPerPhase,
		coinSources: {
			Collection: blocks * 4,
			Bountiful: bountifulCoinsPerPhase,
		},
	});
	const player = {
		crop: { getRates: (_crop: Crop, blocks: number) => cropRates(blocks) },
		spawn: { getRates: (_crop: Crop, blocks: number) => cropRates(blocks) },
		kill: {
			getStatBreakdown: (stat: Stat) => ({
				'Test Crop Fortune': {
					value: 0,
					stat,
				},
			}),
			buildEnvironment: () => ({}),
			collectEffects: () => [],
		},
		getPhaseStat: () => 0,
	} as unknown as PestFarmingPlayer;

	const createCalculator = (intervalSeconds?: number) =>
		new PestFarmingRateCalculator({
			player,
			options: {
				crop: Crop.Wheat,
				cycle: DEFAULT_PEST_CYCLE_SETTINGS,
				intervalSeconds,
			},
			priceBook: {
				version: 'test',
				items: {
					[Crop.NetherWart]: { coins: 4, source: 'npc' },
					FERMENTO: { coins: 10, source: 'manual' },
				},
				missingItemMode: 'zero',
			},
		});

	const result = createCalculator().calculate();
	const bucketTotal = Object.values(result.valuation.byBucket).reduce((sum, value) => sum + value, 0);
	const cropBlocksPerHour = (result.debug.farmBlocks + result.debug.spawnBlocks) * result.debug.cyclesPerHour;
	const expectedCropBreaking =
		cropBlocksPerHour * 4 +
		fermentoPerPhase * 2 * 10 * result.debug.cyclesPerHour +
		bountifulCoinsPerPhase * 2 * result.debug.cyclesPerHour;
	const directPestCoinsPerHour = result.breakdown.pestDrops.total.npcCoins * (3600 / result.debug.cycleSeconds);

	expect(result.valuation.byBucket.cropBreaking).toBeCloseTo(expectedCropBreaking, 8);
	expect(result.valuation.byBucket.npcCoins).toBeCloseTo(directPestCoinsPerHour, 8);
	expect(bucketTotal).toBeCloseTo(result.valuation.coinsPerHour, 8);

	const halfHourResult = createCalculator(1800).calculate();
	const halfHourBucketTotal = Object.values(halfHourResult.valuation.byBucket).reduce((sum, value) => sum + value, 0);

	expect(halfHourBucketTotal).toBeCloseTo(halfHourResult.valuation.coinsPerHour, 8);
});

test('crop breaking uses the best crop tool for max tool outputs', () => {
	const player = new PestFarmingPlayer({
		tools: [
			{
				id: 292,
				count: 1,
				skyblockId: 'THEORETICAL_HOE_WARTS_1',
				uuid: 'early-pest-nether-wart-hoe',
				name: 'Early Newton Nether Warts Hoe',
				lore: [],
				enchantments: {},
				attributes: {},
			},
			{
				id: 293,
				count: 1,
				skyblockId: 'THEORETICAL_HOE_WARTS_3',
				uuid: 'maxed-pest-nether-wart-hoe',
				name: 'Bountiful Newton Nether Warts Hoe',
				lore: [],
				enchantments: {},
				attributes: {
					levelable_lvl: '50',
					levelable_exp: '0',
					modifier: 'bountiful',
				},
			},
		],
	});

	const result = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.NetherWart,
			cycle: {
				...DEFAULT_PEST_CYCLE_SETTINGS,
				blocksPerSecond: 1_000,
				spawnBlocksPerSecond: 1_000,
			},
		},
		priceBook: {
			version: 'test',
			items: {
				[Crop.NetherWart]: { coins: 4, source: 'npc' },
				TOOL_EXP_CAPSULE: { coins: 100_000, source: 'npc' },
			},
			missingItemMode: 'zero',
		},
	}).calculate();

	expect(result.breakdown.cropBreaking.total.items.TOOL_EXP_CAPSULE).toBeGreaterThan(0);
	expect(result.breakdown.cropBreaking.total.npcCoins).toBeGreaterThan(0);
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
				sprayonatorMaterial: Spray.PlantMatter,
				hooveriusVinylTarget: Pest.Slug,
				excludedPests: [Pest.Firefly],
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
	const bucketTotal = Object.values(result.valuation.byBucket).reduce((sum, value) => sum + value, 0);

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
	expect(result.breakdown.pestSpawning.distribution.pestTypeProbabilities).not.property(Pest.Firefly);
	expect(result.breakdown.economy.pestExchanges.items.PESTHUNTER_RELIC).toBeGreaterThan(0);
	expect(result.breakdown.economy.pestShards.rngItems.SHARD_PEST).toBeGreaterThan(0);
	expect(result.breakdown.economy.costs.items.PLANT_MATTER).toBeLessThan(0);

	expect(pestDropCoins).toBeCloseTo(SHEET_BUCKETS.pestDrops, 1);
	expect(result.valuation.byBucket.cropBreaking).toBeCloseTo(SHEET_BUCKETS.cropBreaking, 1);
	expect(result.valuation.byBucket.pestExchanges).toBeCloseTo(SHEET_BUCKETS.pestExchanges, 1);
	expect(result.valuation.byBucket.pestShards).toBeCloseTo(SHEET_BUCKETS.pestShards, 1);
	expect(result.valuation.byBucket.costs).toBeCloseTo(SHEET_BUCKETS.sprayonatorCost, 1);
	expect(result.valuation.byBucket.feastRareCrops).toBe(SHEET_BUCKETS.feastRareCrops);
	expect(bucketTotal).toBeCloseTo(SHEET_BUCKETS.total, 1);
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
	const spawn = {
		getRates,
		selectedPet: {
			type: FarmingPets.Mosquito,
			rarity: Rarity.Legendary,
			level: 100,
		},
	};

	return {
		crop: { getRates },
		spawn,
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
