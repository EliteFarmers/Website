import { expect, test, vi } from 'vitest';
import { Crop, HARVEST_FEAST_MATERIALS } from '../constants/crops.js';
import { ITEM_IDS } from '../constants/itemids.js';
import { Pest, Spray } from '../constants/pests.js';
import { FarmingPets } from '../constants/pets.js';
import { Rarity } from '../constants/reforges.js';
import { SprayonatorTier } from '../constants/specific.js';
import { Stat } from '../constants/stats.js';
import { UpgradeAction, UpgradeCategory, type FortuneUpgrade } from '../constants/upgrades.js';
import { FarmingEquipment } from '../fortune/farmingequipment.js';
import type { EliteItemDto } from '../fortune/item.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { GearSlot } from '../items/definitions.js';
import { FARMING_EQUIPMENT_INFO } from '../items/equipment.js';
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

function equipmentItem(id: keyof typeof FARMING_EQUIPMENT_INFO, uuid: string): EliteItemDto {
	const item = FarmingEquipment.fakeItem(FARMING_EQUIPMENT_INFO[id]!)!;
	item.item.uuid = uuid;
	return item.item;
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
		spawn: {
			getRates: (_crop: Crop, blocks: number) => emptyCropRates(blocks),
		},
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
		getPhaseMechanic: () => 0,
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

test('pest RNG drops use Overbloom without Farming Fortune and add Pet Luck only for pet drops', () => {
	const farmingFortune = 1_200;
	const cropFortune = 600;
	const pestKillFortune = 900;
	const overbloom = 40;
	const petLuck = 300;
	const getRates = (_crop: Crop, blocks: number) => emptyCropRates(blocks);
	const player = {
		crop: { getRates },
		spawn: { getRates },
		kill: {
			getStatBreakdown: (stat: Stat) => ({
				'Test Crop Fortune': {
					value: cropFortune,
					stat,
				},
			}),
			buildEnvironment: () => ({}),
			collectEffects: () => [
				{
					source: 'Test Overbloom',
					op: 'add-rare-pct',
					value: overbloom,
					scope: { tags: ['overbloom'] },
					relatedStats: [Stat.Overbloom],
				},
			],
		},
		getPhaseStat: (phase: PestFarmingPhase, stat: Stat) => {
			if (phase !== PestFarmingPhase.Kill) return 0;
			if (stat === Stat.FarmingFortune) return farmingFortune;
			if (stat === Stat.PestKillFortune) return pestKillFortune;
			if (stat === Stat.Overbloom) return overbloom;
			if (stat === Stat.PetLuck) return petLuck;
			return 0;
		},
		getPhaseMechanic: () => 0,
	} as unknown as PestFarmingPlayer;
	const result = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Pumpkin,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
			attraction: {
				excludedPests: Object.values(Pest).filter((pest) => pest !== Pest.Rat),
			},
		},
	}).calculate();
	const ratDrops = result.breakdown.pestDrops.byPest[Pest.Rat]!;
	const ordinaryDrop = PEST_DROP_DEFINITIONS[Pest.Rat].rareDrops!.find(
		(drop) => drop.itemId === 'VINYL_RODENT_REVOLUTION'
	)!;
	const petDrop = PEST_DROP_DEFINITIONS[Pest.Rat].rareDrops!.find((drop) => drop.itemId === 'RAT')!;

	expect(ratDrops.rngItems[ordinaryDrop.itemId]! / ratDrops.expectedPests).toBeCloseTo(
		ordinaryDrop.amount * ordinaryDrop.chance * (1 + overbloom / 100),
		8
	);
	expect(ratDrops.rngItems[petDrop.itemId]! / ratDrops.expectedPests).toBeCloseTo(
		petDrop.amount * petDrop.chance * (1 + overbloom / 100 + petLuck / 600),
		8
	);
});

test('Slug pet rates use the current 1% Epic and 0.2% Legendary base drop chances', () => {
	const pestsPerHour = 156.2;
	const slugSplit = 0.553;
	const overbloom = 164.4;
	const petLuck = 107;
	const epicSlug = PEST_DROP_DEFINITIONS[Pest.Slug].rareDrops!.find((drop) => drop.itemId === 'SLUG;3')!;
	const legendarySlug = PEST_DROP_DEFINITIONS[Pest.Slug].rareDrops!.find((drop) => drop.itemId === 'SLUG;4')!;

	const expectedLegendarySlugsPerHour =
		pestsPerHour * slugSplit * legendarySlug.chance * (1 + overbloom / 100 + petLuck / 600);

	expect(epicSlug.chance).toBe(0.01);
	expect(legendarySlug.chance).toBe(0.002);
	expect(expectedLegendarySlugsPerHour).toBeCloseTo(0.487578, 6);
});

test('pest drop definitions match the current guaranteed scaling and rare drop chances', () => {
	const expectedScaling: Partial<Record<Pest, number>> = {
		[Pest.Fly]: 52.5,
		[Pest.Cricket]: 15.75,
		[Pest.Locust]: 15.75,
		[Pest.Rat]: 52.5,
		[Pest.Mosquito]: 26.25,
		[Pest.Worm]: 10.5,
		[Pest.Mite]: 26.25,
		[Pest.Moth]: 18,
		[Pest.Slug]: 52.5,
		[Pest.Beetle]: 18,
		[Pest.Dragonfly]: 26.25,
		[Pest.Firefly]: 26.25,
		[Pest.Mantis]: 26.25,
	};
	for (const [pest, scalingFortune] of Object.entries(expectedScaling) as [Pest, number][]) {
		for (const drop of PEST_DROP_DEFINITIONS[pest].guaranteedDrops) {
			expect(drop.scalingFortune, `${pest} guaranteed drop scaling`).toBe(scalingFortune);
		}
	}

	const rareChance = (pest: Pest, itemId: string): number | undefined =>
		PEST_DROP_DEFINITIONS[pest].rareDrops?.find((drop) => drop.itemId === itemId)?.chance;
	const expectedRareChances: [Pest, string, number][] = [
		[Pest.Fly, 'BEADY_EYES', 0.03],
		[Pest.Fly, ITEM_IDS.EnchantedHayBale, 0.0075],
		[Pest.Cricket, 'ENCHANTED_GOLDEN_CARROT', 0.0075],
		[Pest.Cricket, 'CHIRPING_STEREO', 0.01],
		[Pest.Locust, 'LOCUST_LARVA', 0.04],
		[Pest.Locust, 'ENCHANTED_BAKED_POTATO', 0.0075],
		[Pest.Rat, 'POLISHED_PUMPKIN', 0.0075],
		[Pest.Rat, 'RAT', 0.004],
		[Pest.Mosquito, 'ENCHANTED_SUGAR_CANE', 0.0075],
		[Pest.Mosquito, 'CLIPPED_WINGS', 0.02],
		[Pest.Worm, 'BOOKWORMS_FAVORITE_BOOK', 0.04],
		[Pest.Worm, 'ENCHANTED_MELON_BLOCK', 0.0075],
		[Pest.Mite, 'ENCHANTED_CACTUS', 0.0075],
		[Pest.Mite, 'ATMOSPHERIC_FILTER', 0.005],
		[Pest.Moth, 'ENCHANTED_COOKIE', 0.0075],
		[Pest.Moth, 'WRIGGLING_LARVA', 0.01],
		[Pest.Slug, ITEM_IDS.EnchantedRedMushroomBlock, 0.00375],
		[Pest.Slug, ITEM_IDS.EnchantedBrownMushroomBlock, 0.00375],
		[Pest.Slug, 'SLUG;3', 0.01],
		[Pest.Slug, 'SLUG;4', 0.002],
		[Pest.Beetle, 'ENCHANTMENT_PESTERMINATOR_1', 0.07],
		[Pest.Beetle, 'MUTANT_NETHER_STALK', 0.0075],
		[Pest.Dragonfly, ITEM_IDS.VerminVaporizerChip, 0.02],
		[Pest.Dragonfly, 'COMPACTED_SUNFLOWER', 0.0075],
		[Pest.Firefly, 'FIRE_IN_A_BOTTLE', 0.02],
		[Pest.Firefly, 'COMPACTED_MOONFLOWER', 0.0075],
		[Pest.Mantis, 'MANTID_CLAW', 0.02],
		[Pest.Mantis, 'COMPACTED_WILD_ROSE', 0.0075],
		[Pest.Mouse, 'SQUEAKY_TOY', 0.05],
		[Pest.Mouse, 'SQUEAKY_MOUSEMAT', 0.01],
		[Pest.Mouse, 'DYE_DUNG', 0.00002],
		[Pest.LunarMoth, 'ENCHANTMENT_ULTIMATE_SUNSET_1', 0.35],
	];
	for (const [pest, itemId, chance] of expectedRareChances) {
		expect(rareChance(pest, itemId), `${pest} ${itemId}`).toBe(chance);
	}

	for (const pest of Object.values(Pest).filter((pest) => pest !== Pest.Mouse && pest !== Pest.LunarMoth)) {
		expect(
			PEST_DROP_DEFINITIONS[pest].rareDrops?.find((drop) => drop.itemId.startsWith('VINYL_'))?.chance,
			`${pest} vinyl chance`
		).toBe(0.05);
		expect(rareChance(pest, 'DYE_DUNG'), `${pest} Dung Dye chance`).toBe(0.000004);
	}
	expect(
		PEST_DROP_DEFINITIONS[Pest.LunarMoth].rareDrops
			?.filter((drop) => drop.itemId === 'DYE_DUNG')
			.map((drop) => drop.chance)
	).toEqual([0.000004, 0.00002]);

	expect(PEST_DROP_DEFINITIONS[Pest.LunarMoth].guaranteedDrops).toMatchObject([
		{ crop: Crop.Sunflower, itemId: 'ENCHANTED_SUNFLOWER', baseAmount: 2, scalingFortune: 26.25 },
		{ crop: Crop.Moonflower, itemId: 'ENCHANTED_MOONFLOWER', baseAmount: 2, scalingFortune: 26.25 },
		{ crop: Crop.WildRose, itemId: 'ENCHANTED_WILD_ROSE', baseAmount: 2, scalingFortune: 26.25 },
	]);
});

test('Harvest Feast pest drops are calculated from the live in-season crop list', () => {
	const feastPlayer = new PestFarmingPlayer({
		harvestFeast: { active: true, inSeasonCrops: [Crop.Wheat, Crop.Carrot] },
	});
	const onlyPest = (pest: Pest) => ({
		includeSpecialPests: pest === Pest.Mouse,
		excludedPests: Object.values(Pest).filter((candidate) => candidate !== pest),
	});
	const flyResult = new PestFarmingRateCalculator({
		player: feastPlayer,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
			attraction: onlyPest(Pest.Fly),
		},
	}).calculate();
	const expectedFlies = flyResult.breakdown.pestDrops.byPest[Pest.Fly]!.expectedPests;

	expect(flyResult.breakdown.economy.feastRareCrops.rngItems[HARVEST_FEAST_MATERIALS[Crop.Wheat]!]).toBeCloseTo(
		expectedFlies * 0.15,
		8
	);
	expect(flyResult.breakdown.economy.feastRareCrops.rngItems[HARVEST_FEAST_MATERIALS[Crop.Carrot]!]).toBeUndefined();

	const mouseResult = new PestFarmingRateCalculator({
		player: feastPlayer,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
			attraction: onlyPest(Pest.Mouse),
		},
	}).calculate();
	const expectedMice = mouseResult.breakdown.pestDrops.byPest[Pest.Mouse]!.expectedPests;
	const mouseFeastDrops = mouseResult.breakdown.economy.feastRareCrops.rngItems;

	expect(mouseFeastDrops[HARVEST_FEAST_MATERIALS[Crop.Wheat]!]).toBeCloseTo(expectedMice * 0.15, 8);
	expect(mouseFeastDrops[HARVEST_FEAST_MATERIALS[Crop.Carrot]!]).toBeCloseTo(expectedMice * 0.15, 8);
	expect(Object.values(mouseFeastDrops).reduce((sum, amount) => sum + amount, 0)).toBeCloseTo(expectedMice * 0.3, 8);
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

test('Sprayonator tiers multiply the spawn chance roll without changing pest weights', () => {
	const player = new PestFarmingPlayer({});
	const calculate = (sprayedPlot: boolean, sprayonatorTier: SprayonatorTier) =>
		new PestFarmingRateCalculator({
			player,
			options: {
				crop: Crop.Wheat,
				cycle: { ...DEFAULT_PEST_CYCLE_SETTINGS, sprayedPlot },
				attraction: { sprayonatorMaterial: Spray.PlantMatter, sprayonatorTier },
			},
		}).calculate();

	expect(calculate(false, SprayonatorTier.Salty).debug.spawnChancePerBreak).toBe(0.002);
	expect(calculate(true, SprayonatorTier.Regular).debug.spawnChancePerBreak).toBe(0.003);
	expect(calculate(true, SprayonatorTier.Juicy).debug.spawnChancePerBreak).toBe(0.004);
	expect(calculate(true, SprayonatorTier.Salty).debug.spawnChancePerBreak).toBe(0.006);
	expect(calculate(true, SprayonatorTier.Regular).breakdown.pestSpawning.distribution.pestTypeWeights).toEqual(
		calculate(true, SprayonatorTier.Salty).breakdown.pestSpawning.distribution.pestTypeWeights
	);
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

test('normal spawn pools contain twelve base-weight pests and swap the daylight pest', () => {
	const player = new PestFarmingPlayer({});
	const weightsFor = (timeOfDay: 'day' | 'night') =>
		new PestFarmingRateCalculator({
			player,
			options: {
				crop: Crop.Wheat,
				cycle: DEFAULT_PEST_CYCLE_SETTINGS,
				attraction: { timeOfDay },
			},
		}).calculate().breakdown.pestSpawning.distribution.pestTypeWeights;
	const dayWeights = weightsFor('day');
	const nightWeights = weightsFor('night');

	expect(Object.keys(dayWeights)).toHaveLength(12);
	expect(Object.values(dayWeights)).toEqual(Array(12).fill(100));
	expect(dayWeights[Pest.Dragonfly]).toBe(100);
	expect(dayWeights[Pest.Firefly]).toBeUndefined();
	expect(dayWeights[Pest.Mouse]).toBeUndefined();
	expect(dayWeights[Pest.LunarMoth]).toBeUndefined();
	expect(nightWeights[Pest.Dragonfly]).toBeUndefined();
	expect(nightWeights[Pest.Firefly]).toBe(100);
});

test('mosquito smooth jazz scales the additive vinyl attraction bonus using rarity breakpoints', () => {
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
			getPhaseMechanic: () => 0,
			phaseLoadouts: {},
			armorSetLoadouts: [],
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

	expect(getVinylTargetWeight()).toBe(1_100);
	expect(
		getVinylTargetWeight({
			type: FarmingPets.Slug,
			rarity: Rarity.Legendary,
			level: 100,
		})
	).toBe(1_100);
	expect(getMosquitoWeight(Rarity.Common)).toBe(1_350);
	expect(getMosquitoWeight(Rarity.Uncommon)).toBe(1_350);
	expect(getMosquitoWeight(Rarity.Rare)).toBe(1_450);
	expect(getMosquitoWeight(Rarity.Epic)).toBe(1_600);
	expect(getMosquitoWeight(Rarity.Legendary)).toBe(1_600);
});

test('official pest weights add Sprayonator and vinyl bonuses to the base weights', () => {
	const player = new PestFarmingPlayer({});
	const result = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
			attraction: {
				sprayonatorMaterial: Spray.PlantMatter,
				hooveriusVinylTarget: Pest.Slug,
				timeOfDay: 'day',
			},
		},
	}).calculate();

	const probabilities = result.breakdown.pestSpawning.distribution.pestTypeProbabilities;
	expect(probabilities[Pest.Slug]).toBeCloseTo(2_100 / 4_200, 8);
	expect(probabilities[Pest.Locust]).toBeCloseTo(1_100 / 4_200, 8);
	expect(probabilities[Pest.Mosquito]).toBeCloseTo(100 / 4_200, 8);
	expect(probabilities[Pest.Firefly]).toBeUndefined();
});

test('Moth Shard is attributed to spawn and reduces both pest cooldown and farm phase by five seconds', () => {
	const calculate = (player: PestFarmingPlayer) =>
		new PestFarmingRateCalculator({
			player,
			options: {
				crop: Crop.Wheat,
				cycle: DEFAULT_PEST_CYCLE_SETTINGS,
			},
		}).calculate();
	const before = calculate(new PestFarmingPlayer({}));
	const after = calculate(new PestFarmingPlayer({ attributes: { pest_cooldown: 999 } }));

	expect(after.phaseStats.spawnPestCooldownReductionSecondsBreakdown).toEqual({ 'Moth Shard': 5 });
	expect(after.phaseStats.spawnPestCooldownReductionSeconds).toBe(5);
	expect(after.debug.cooldownSeconds).toBe(before.debug.cooldownSeconds - 5);
	expect(after.debug.farmSeconds).toBe(before.debug.farmSeconds - 5);
});

test('Moth Shard applies after maximum percentage reductions without an artificial cooldown floor', () => {
	const player = new PestFarmingPlayer({ attributes: { pest_cooldown: 999 } });
	const getPhaseStatBreakdown = player.getPhaseStatBreakdown.bind(player);
	vi.spyOn(player, 'getPhaseStatBreakdown').mockImplementation((phase, stat, crop) => {
		if (phase === PestFarmingPhase.Spawn && stat === Stat.PestCooldownReduction) {
			return { 'Maximum Percentage Reduction': { value: 55, stat } };
		}
		return getPhaseStatBreakdown(phase, stat, crop);
	});
	const calculate = (finneganActive: boolean) =>
		new PestFarmingRateCalculator({
			player,
			options: {
				crop: Crop.Wheat,
				cycle: { ...DEFAULT_PEST_CYCLE_SETTINGS, finneganActive },
			},
		}).calculate();

	expect(calculate(false).debug.cooldownSeconds).toBe(130);
	expect(calculate(true).debug.cooldownSeconds).toBe(70);
});

test('current spawn equipment determines when the fixed pest cooldown threshold is reached', () => {
	const slots = [GearSlot.Necklace, GearSlot.Cloak, GearSlot.Belt, GearSlot.Gloves] as const;
	const blossomIds = ['BLOSSOM_NECKLACE', 'BLOSSOM_CLOAK', 'BLOSSOM_BELT', 'BLOSSOM_BRACELET'] as const;
	const pesthunterIds = [
		'PESTHUNTERS_NECKLACE',
		'PESTHUNTERS_CLOAK',
		'PESTHUNTERS_BELT',
		'PESTHUNTERS_GLOVES',
	] as const;
	const blossomPieces = Object.fromEntries(slots.map((slot, index) => [slot, `blossom-${index}`]));
	const pesthunterPieces = Object.fromEntries(slots.map((slot, index) => [slot, `pesthunter-${index}`]));
	const equipment = [
		...blossomIds.map((id, index) => equipmentItem(id, `blossom-${index}`)),
		...pesthunterIds.map((id, index) => equipmentItem(id, `pesthunter-${index}`)),
	];
	const createPlayer = (farmEquipmentSetId: string, spawnEquipmentSetId: string) =>
		new PestFarmingPlayer({
			equipment,
			equipmentSets: [
				{ id: 'blossom', name: 'Blossom', pieces: blossomPieces },
				{ id: 'pesthunter', name: 'Pesthunter', pieces: pesthunterPieces },
			],
			loadoutPresets: [
				{ id: 'farm', name: 'Farm', equipmentSetId: farmEquipmentSetId },
				{ id: 'spawn', name: 'Spawn', equipmentSetId: spawnEquipmentSetId },
				{ id: 'kill', name: 'Kill', equipmentSetId: 'blossom' },
			],
			phasePresetIds: {
				[PestFarmingPhase.Farm]: 'farm',
				[PestFarmingPhase.Spawn]: 'spawn',
				[PestFarmingPhase.Kill]: 'kill',
			},
		});
	const calculate = (player: PestFarmingPlayer) =>
		new PestFarmingRateCalculator({
			player,
			options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
		}).calculate();

	const pesthunterAtSpawn = calculate(createPlayer('blossom', 'pesthunter'));
	const pesthunterWhileFarming = calculate(createPlayer('pesthunter', 'blossom'));

	expect(pesthunterAtSpawn.phaseStats.spawnPestCooldownReduction).toBe(40);
	expect(pesthunterAtSpawn.debug.cooldownSeconds).toBe(180);
	expect(pesthunterWhileFarming.phaseStats.spawnPestCooldownReduction).toBe(0);
	expect(pesthunterWhileFarming.debug.cooldownSeconds).toBe(300);
});

test('Sprayonator tiers use the same official material attraction weight', () => {
	const weightsFor = (sprayonatorTier: SprayonatorTier) =>
		new PestFarmingRateCalculator({
			player: new PestFarmingPlayer({}),
			options: {
				crop: Crop.Wheat,
				cycle: DEFAULT_PEST_CYCLE_SETTINGS,
				attraction: { sprayonatorMaterial: Spray.PlantMatter, sprayonatorTier },
			},
		}).calculate().breakdown.pestSpawning.distribution.pestTypeWeights;

	expect(weightsFor(SprayonatorTier.Regular)[Pest.Slug]).toBe(1_100);
	expect(weightsFor(SprayonatorTier.Juicy)[Pest.Slug]).toBe(1_100);
	expect(weightsFor(SprayonatorTier.Salty)[Pest.Slug]).toBe(1_100);
});

test('max Mosquito raises the vinyl bonus from 1000 to 1500 weight', () => {
	const getRates = (_crop: Crop, blocks: number) => emptyCropRates(blocks);
	const player = {
		crop: { getRates },
		spawn: {
			getRates,
			selectedPet: {
				type: FarmingPets.Mosquito,
				rarity: Rarity.Legendary,
				level: 100,
			},
		},
		kill: {
			getStatBreakdown: () => ({}),
			buildEnvironment: () => ({}),
			collectEffects: () => [],
		},
		getPhaseStat: () => 0,
		getPhaseMechanic: () => 0,
		phaseLoadouts: {},
		armorSetLoadouts: [],
		selectedVacuum: undefined,
	} as unknown as PestFarmingPlayer;
	const distribution = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
			attraction: {
				sprayonatorMaterial: Spray.PlantMatter,
				hooveriusVinylTarget: Pest.Slug,
				timeOfDay: 'day',
			},
		},
	}).calculate().breakdown.pestSpawning.distribution;

	expect(distribution.pestTypeWeights[Pest.Slug]).toBe(2_600);
	expect(distribution.pestTypeProbabilities[Pest.Slug]).toBeCloseTo(2_600 / 4_700, 8);
	expect(distribution.pestTypeProbabilities[Pest.Locust]).toBeCloseTo(1_100 / 4_700, 8);
	expect(distribution.pestTypeProbabilities[Pest.Mosquito]).toBeCloseTo(100 / 4_700, 8);
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

test('best spawn phase armor selection reuses one working clone for every candidate', () => {
	const player = pestPlayerWithArmorSets({
		main: ['CROPIE_HELMET', 'CROPIE_CHESTPLATE', 'CROPIE_LEGGINGS', 'CROPIE_BOOTS'],
		spawn: ['HELIANTHUS_HELMET', 'HELIANTHUS_CHESTPLATE', 'HELIANTHUS_LEGGINGS', 'HELIANTHUS_BOOTS'],
	});
	const clone = vi.spyOn(player, 'clone');
	const calculator = new PestFarmingRateCalculator({
		player,
		options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
	});

	expect(calculator.getBestSpawnPhaseArmorSetId(['main', 'spawn'])).toBe('spawn');
	expect(clone).toHaveBeenCalledTimes(1);
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

test('pest rate calculation derives Mantid recent pest kills from the rolling ten-minute window', () => {
	const player = new PestFarmingPlayer({
		armor: [
			mantidArmor('HELIANTHUS_HELMET', 'mantid-helmet'),
			mantidArmor('HELIANTHUS_CHESTPLATE', 'mantid-chestplate'),
			mantidArmor('HELIANTHUS_LEGGINGS', 'mantid-leggings'),
			mantidArmor('HELIANTHUS_BOOTS', 'mantid-boots'),
		],
	});
	const baseBonusPestChance = player.getPhaseStat(PestFarmingPhase.Spawn, Stat.BonusPestChance);

	const result = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Wheat,
			cycle: DEFAULT_PEST_CYCLE_SETTINGS,
		},
	}).calculate();

	expect(player.options.mantidPestKills).toBeUndefined();
	expect(baseBonusPestChance).toBe(88);
	const expectedRecentKills = Math.min(
		20,
		(result.breakdown.pestSpawning.expectedPestsPerSpawn * result.debug.cyclesPerHour) / 6
	);
	expect(result.phaseStats.spawnMantidRecentPestKills).toBeCloseTo(expectedRecentKills, 6);
	expect(result.phaseStats.spawnBonusPestChance).toBeCloseTo(baseBonusPestChance + expectedRecentKills, 6);
	const mantidBonusEntries = Object.entries(result.phaseStats.spawnBonusPestChanceBreakdown).filter(([source]) =>
		source.endsWith('(Mantid Bonus)')
	);
	expect(mantidBonusEntries).toHaveLength(4);
	expect(mantidBonusEntries.every(([, value]) => Math.abs(value - expectedRecentKills * 0.25) < 1e-6)).toBe(true);
});

test('Mantid resolution is independent of configured kills and does not clone the player', () => {
	const armor = [mantidArmor('HELIANTHUS_HELMET', 'mantid-helmet')];
	const createResult = (mantidPestKills?: number) => {
		const player = new PestFarmingPlayer({ armor, mantidPestKills });
		const clone = vi.spyOn(player, 'clone');
		const result = new PestFarmingRateCalculator({
			player,
			options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
		}).calculate();
		return { result, clone };
	};

	const unconfigured = createResult();
	const capped = createResult(20);
	expect(capped.result.phaseStats.spawnBonusPestChance).toBeCloseTo(
		unconfigured.result.phaseStats.spawnBonusPestChance,
		8
	);
	expect(unconfigured.clone).not.toHaveBeenCalled();
	expect(capped.clone).not.toHaveBeenCalled();
});

test.each([1, 4])('Mantid scalar resolution honors the recent-kill cap with %i active pieces', (pieceCount) => {
	const armor = [
		mantidArmor('HELIANTHUS_HELMET', 'mantid-helmet'),
		mantidArmor('HELIANTHUS_CHESTPLATE', 'mantid-chestplate'),
		mantidArmor('HELIANTHUS_LEGGINGS', 'mantid-leggings'),
		mantidArmor('HELIANTHUS_BOOTS', 'mantid-boots'),
	].slice(0, pieceCount);
	const configuredKills = 7;
	const baseBonusPestChance = 2_500;
	const player = new PestFarmingPlayer({
		armor,
		mantidPestKills: configuredKills,
	});
	const originalGetPhaseStatBreakdown = player.getPhaseStatBreakdown.bind(player);
	vi.spyOn(player, 'getPhaseStatBreakdown').mockImplementation((phase, stat, crop) => {
		if (phase === PestFarmingPhase.Spawn && stat === Stat.BonusPestChance) {
			return {
				'Base Bonus Pest Chance': { value: baseBonusPestChance, stat },
				'Configured (Mantid Bonus)': { value: configuredKills * pieceCount * 0.25, stat },
			};
		}
		return originalGetPhaseStatBreakdown(phase, stat, crop);
	});
	const clone = vi.spyOn(player, 'clone');

	const result = new PestFarmingRateCalculator({
		player,
		options: {
			crop: Crop.Wheat,
			cycle: { ...DEFAULT_PEST_CYCLE_SETTINGS, maxActivePests: 100 },
		},
	}).calculate();

	expect(result.phaseStats.spawnBonusPestChance).toBe(baseBonusPestChance + 20 * pieceCount * 0.25);
	expect(result.phaseStats.spawnMantidRecentPestKills).toBe(20);
	expect(clone).not.toHaveBeenCalled();
});

test('Mantid kill timers survive a loadout swap but use the active set piece count', () => {
	const createPlayer = (killSetId: 'kill-mantid' | 'kill-plain') =>
		new PestFarmingPlayer({
			armor: [
				mantidArmor('HELIANTHUS_HELMET', 'spawn-mantid-helmet'),
				mantidArmor('FERMENTO_CHESTPLATE', 'kill-mantid-chestplate'),
				armorItem('FERMENTO_CHESTPLATE', 'kill-plain-chestplate'),
			],
			armorSets: [
				{
					id: 'spawn-mantid',
					name: 'Spawn Mantid',
					pieces: { [GearSlot.Helmet]: 'spawn-mantid-helmet' },
				},
				{
					id: 'kill-mantid',
					name: 'Kill Mantid',
					pieces: { [GearSlot.Chestplate]: 'kill-mantid-chestplate' },
				},
				{
					id: 'kill-plain',
					name: 'Kill Plain',
					pieces: { [GearSlot.Chestplate]: 'kill-plain-chestplate' },
				},
			],
			loadoutPresets: [
				{ id: 'spawn', name: 'Spawn', armorSetId: 'spawn-mantid' },
				{ id: 'kill', name: 'Kill', armorSetId: killSetId },
			],
			phasePresetIds: {
				[PestFarmingPhase.Farm]: 'kill',
				[PestFarmingPhase.Spawn]: 'spawn',
				[PestFarmingPhase.Kill]: 'kill',
			},
		});
	const calculate = (player: PestFarmingPlayer) =>
		new PestFarmingRateCalculator({
			player,
			options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
		}).calculate();
	const withMantidWhileKilling = createPlayer('kill-mantid');
	const withoutMantidWhileKilling = createPlayer('kill-plain');
	const active = calculate(withMantidWhileKilling);
	const inactive = calculate(withoutMantidWhileKilling);
	const baseSpawnBonus = withMantidWhileKilling.getPhaseStat(PestFarmingPhase.Spawn, Stat.BonusPestChance);

	expect(active.phaseStats.spawnMantidRecentPestKills).toBeGreaterThan(0);
	expect(active.phaseStats.spawnBonusPestChance).toBeCloseTo(
		baseSpawnBonus + active.phaseStats.spawnMantidRecentPestKills * 0.25,
		6
	);
	expect(active.phaseStats.spawnBonusPestChanceBreakdown['Helianthus Helmet (Mantid Bonus)']).toBeCloseTo(
		active.phaseStats.spawnMantidRecentPestKills * 0.25,
		6
	);
	expect(inactive.phaseStats.spawnMantidRecentPestKills).toBe(0);
	expect(inactive.phaseStats.spawnBonusPestChance).toBeCloseTo(baseSpawnBonus, 8);
	expect(inactive.phaseStats.spawnBonusPestChanceBreakdown).not.toHaveProperty('Helianthus Helmet (Mantid Bonus)');
});

test('PestFarmingPlayer clones keep loadouts and item data deeply independent', () => {
	const player = pestPlayerWithArmorSets({
		main: ['CROPIE_HELMET', 'CROPIE_CHESTPLATE', 'CROPIE_LEGGINGS', 'CROPIE_BOOTS'],
		spawn: ['HELIANTHUS_HELMET', 'HELIANTHUS_CHESTPLATE', 'HELIANTHUS_LEGGINGS', 'HELIANTHUS_BOOTS'],
	});
	const cloned = player.clone();
	cloned.setPhaseArmorSet(PestFarmingPhase.Spawn, 'main');
	cloned.crop.armor[0]!.item.attributes!.modifier = 'mantid';

	expect(player.phaseLoadouts[PestFarmingPhase.Spawn]?.armorSetId).toBe('spawn');
	expect(cloned.phaseLoadouts[PestFarmingPhase.Spawn]?.armorSetId).toBe('main');
	expect(player.crop.armor[0]!.item.attributes?.modifier).toBeUndefined();
});

test('mechanics key changes when farm-only gear changes output', () => {
	const player = pestPlayerWithArmorSets({
		main: ['CROPIE_HELMET', 'CROPIE_CHESTPLATE', 'CROPIE_LEGGINGS', 'CROPIE_BOOTS'],
		spawn: ['HELIANTHUS_HELMET', 'HELIANTHUS_CHESTPLATE', 'HELIANTHUS_LEGGINGS', 'HELIANTHUS_BOOTS'],
	});
	player.setPhaseArmorSet(PestFarmingPhase.Spawn, 'spawn');
	player.setPhaseArmorSet(PestFarmingPhase.Kill, 'spawn');
	const calculator = () =>
		new PestFarmingRateCalculator({
			player,
			options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
		});
	const before = calculator().calculate();

	player.applyPhaseUpgrade(PestFarmingPhase.Farm, {
		title: 'Mossy Croppie Helmet',
		increase: 0,
		action: UpgradeAction.Upgrade,
		category: UpgradeCategory.Reforge,
		meta: { type: 'reforge', id: 'mossy', itemUuid: 'main-helmet' },
	});
	const after = calculator().calculate();

	expect(after.breakdown.cropBreaking.farm.collection).toBeGreaterThan(before.breakdown.cropBreaking.farm.collection);
	expect(after.mechanicsKey).not.toBe(before.mechanicsKey);
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

test('hypothetical pest upgrade impacts do not mutate profile progression', () => {
	const player = new PestFarmingPlayer({
		selectedCrop: Crop.Wheat,
		plots: ['1'],
		cropUpgrades: { [Crop.Wheat]: 2 },
		exportableCrops: { [Crop.Wheat]: false },
		attributes: { insect_power: 1 },
		chips: { cropshot: 1 },
		chipRarities: { cropshot: Rarity.Rare },
	});
	const phasePlayer = player.getPhasePlayer(PestFarmingPhase.Farm);
	const stateUpgrades: FortuneUpgrade[] = [
		{
			title: 'Praying Mantis 2',
			increase: 0,
			action: UpgradeAction.LevelUp,
			category: UpgradeCategory.Misc,
			meta: { type: 'attribute', key: 'insect_power', value: 2 },
		},
		{
			title: 'Cropshot Chip 2',
			increase: 0,
			action: UpgradeAction.LevelUp,
			category: UpgradeCategory.Misc,
			meta: { type: 'chip', id: 'CROPSHOT_GARDEN_CHIP', value: 2 },
		},
		{
			title: 'Epic Cropshot Chip',
			increase: 0,
			action: UpgradeAction.Upgrade,
			category: UpgradeCategory.Misc,
			meta: { type: 'chip_rarity', id: 'CROPSHOT_GARDEN_CHIP', value: Rarity.Epic },
		},
	];
	const upgrades: (FortuneUpgrade | undefined)[] = [
		phasePlayer.getUpgrades({ stat: Stat.FarmingFortune }).find((entry) => entry.meta?.type === 'plot'),
		phasePlayer.getCropUpgrades(Crop.Wheat).find((entry) => entry.meta?.type === 'crop_upgrade'),
		phasePlayer.getCropUpgrades(Crop.Wheat).find((entry) => entry.meta?.id === 'exportable_crop'),
		...stateUpgrades,
	];
	const calculator = new PestFarmingRateCalculator({
		player,
		options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
	});
	const before = calculator.calculate();

	for (const upgrade of upgrades) {
		expect(upgrade).toBeDefined();
		calculator.calculateUpgradeImpact({
			phase: PestFarmingPhase.Farm,
			upgrade: upgrade!,
			before,
		});
	}

	expect(player.options.plots).toStrictEqual(['1']);
	expect(player.options.cropUpgrades?.[Crop.Wheat]).toBe(2);
	expect(player.options.exportableCrops?.[Crop.Wheat]).toBe(false);
	expect(player.options.attributes?.insect_power).toBe(1);
	expect(player.options.chips?.cropshot).toBe(1);
	expect(player.options.chipRarities?.cropshot).toBe(Rarity.Rare);
	expect(player.getPhasePlayer(PestFarmingPhase.Farm).options.plots).toStrictEqual(['1']);
	expect(player.getPhasePlayer(PestFarmingPhase.Farm).options.cropUpgrades?.[Crop.Wheat]).toBe(2);
	expect(player.getPhasePlayer(PestFarmingPhase.Farm).options.exportableCrops?.[Crop.Wheat]).toBe(false);
	expect(player.getPhasePlayer(PestFarmingPhase.Farm).options.attributes?.insect_power).toBe(1);
	expect(player.getPhasePlayer(PestFarmingPhase.Farm).options.chips?.cropshot).toBe(1);
	expect(player.getPhasePlayer(PestFarmingPhase.Farm).options.chipRarities?.cropshot).toBe(Rarity.Rare);
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
		.find((entry) => entry.title === 'Farmhand Helmet');

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

test('price-only revaluation preserves mechanics and matches a fresh calculation', () => {
	const player = new PestFarmingPlayer({
		selectedCrop: Crop.Wheat,
		wrigglingLarva: 0,
	});
	const emptyPriceBook: PestRatePriceBook = {
		version: 'empty',
		items: {},
		missingItemMode: 'exclude',
	};
	const pricedBook: PestRatePriceBook = {
		version: 'priced',
		items: { [Crop.Wheat]: { coins: 12, source: 'manual' } },
		missingItemMode: 'exclude',
	};
	const calculator = new PestFarmingRateCalculator({
		player,
		options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
		priceBook: emptyPriceBook,
	});
	const result = calculator.calculate();
	const revalued = calculator.revalueResult(result, pricedBook);
	const fresh = calculator.withPriceBook(pricedBook).calculate();

	expect(revalued.mechanicsKey).toBe(result.mechanicsKey);
	expect(revalued.stateKey).not.toBe(result.stateKey);
	expect(revalued.stateKey).toBe(fresh.stateKey);
	expect(revalued.valuation).toEqual(fresh.valuation);

	const upgrade = player
		.getPhaseUpgrades(PestFarmingPhase.Spawn, { stat: Stat.BonusPestChance })
		.find((entry) => entry.title === 'Wriggling Larva');
	expect(upgrade).toBeDefined();
	const impact = calculator.calculateUpgradeImpact({
		phase: PestFarmingPhase.Spawn,
		upgrade: upgrade!,
		before: result,
	});
	const revaluedImpact = calculator.revalueUpgradeImpact(impact, pricedBook);
	const freshCalculator = calculator.withPriceBook(pricedBook);
	const freshImpact = freshCalculator.calculateUpgradeImpact({
		phase: PestFarmingPhase.Spawn,
		upgrade: upgrade!,
		before: fresh,
	});

	expect(revaluedImpact.delta).toEqual(freshImpact.delta);
	expect(revaluedImpact.valuationDelta).toEqual(freshImpact.valuationDelta);
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
		getPhaseMechanic: () => 0,
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
				name: 'Early Newton Nether Wart Cutter Hoe',
				lore: [],
				enchantments: {},
				attributes: {},
			},
			{
				id: 293,
				count: 1,
				skyblockId: 'THEORETICAL_HOE_WARTS_3',
				uuid: 'maxed-pest-nether-wart-hoe',
				name: 'Bountiful Newton Nether Wart Cutter Hoe',
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
	pestDrops: 20_642_203.05,
	cropBreaking: 26_930_389.64,
	pestExchanges: 832_681.5646,
	pestShards: 480_064.2704,
	sprayonatorCost: -25_168.4,
	stinkyCheeseCost: 0,
	feastRareCrops: 0,
	total: 48_860_170.12,
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

test('matches the reference fixture with official pest spawn weights', () => {
	const calculator = new PestFarmingRateCalculator({
		player: createSheetFixturePlayer(),
		options: {
			crop: Crop.Wheat,
			cycle: sheetCycleSettings,
			attraction: {
				sprayonatorMaterial: Spray.PlantMatter,
				sprayonatorTier: SprayonatorTier.Juicy,
				hooveriusVinylTarget: Pest.Slug,
				timeOfDay: 'day',
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
	expect(result.breakdown.pestSpawning.distribution.pestTypeProbabilities[Pest.Locust]).toBeCloseTo(1_100 / 4_700, 8);
	expect(result.breakdown.pestSpawning.distribution.pestTypeProbabilities[Pest.Slug]).toBeCloseTo(2_600 / 4_700, 8);
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
			if (phase === PestFarmingPhase.Spawn && stat === Stat.PestCooldownReduction) return 55;
			if (phase === PestFarmingPhase.Spawn && stat === Stat.BonusPestChance) return 500.5;
			return 0;
		},
		getPhaseMechanic: () => 0,
		phaseLoadouts: {},
		armorSetLoadouts: [],
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
