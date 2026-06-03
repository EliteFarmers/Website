import { Crop } from '../constants/crops.js';
import { Pest } from '../constants/pests.js';
import { Stat } from '../constants/stats.js';
import type { FortuneUpgrade } from '../constants/upgrades.js';
import { resolveDropEffects } from '../effects/resolver.js';
import type { DropTag } from '../effects/types.js';
import { PestFarmingPhase, type PestFarmingPlayer } from '../player/pestfarmingplayer.js';
import type { DetailedDropsFromEffectsResult } from '../util/ratecalc-effects.js';
import {
	calculatePestCropDropAmount,
	getAssociatedCropFortune,
	NATURAL_PESTS,
	PEST_DROP_DEFINITIONS,
	type PestDropDefinition,
} from './pest-drops.js';
import type {
	DetailedPestDropsResult,
	PestAttractionSettings,
	PestCycleDebug,
	PestCycleSettings,
	PestEconomySettings,
	PestFarmingRateCalculatorInput,
	PestFarmingRateDelta,
	PestFarmingRateOptions,
	PestFarmingRateResult,
	PestFarmingUpgradeImpactRequest,
	PestFarmingUpgradeRateImpact,
	PestRatePhaseStats,
	PestRatePriceBook,
	PestRateQuantities,
	PestRateValuationDelta,
	PestRateValuationResult,
	PestSpawnDistribution,
} from './pest-rate-types.js';

const DEFAULT_INTERVAL_SECONDS = 3600;
const BASE_SPAWN_CHANCE_PER_BREAK = 0.002;
const SPRAYED_PLOT_SPAWN_MULTIPLIER = 2;
const ATMOSPHERIC_FILTER_SPAWN_MULTIPLIER = 1.15;
const DEFAULT_PEST_MAX_ACTIVE = 8;
const PEST_RARE_DROP_FORTUNE_SCALING = 600;

type PestDropCalculationContext = {
	farmingFortune: number;
	pestKillFortune: number;
	petLuck: number;
	associatedCropFortune: Partial<Record<Crop, number>>;
	env: ReturnType<PestFarmingPlayer['kill']['buildEnvironment']>;
	effects: ReturnType<PestFarmingPlayer['kill']['collectEffects']>;
};

export const DEFAULT_PEST_CYCLE_SETTINGS: PestCycleSettings = {
	blocksPerSecond: 20,
	spawnBlocksPerSecond: 20,
	farmSwapBeforeCooldownSeconds: 12,
	farmToSpawnSwapSeconds: 4,
	spawnToKillSwapSeconds: 4,
	fixedKillSetupSeconds: 2,
	fixedPestSearchSeconds: 8,
	secondsPerPestKill: 1.5,
	returnToFarmSeconds: 4,
	activePestsAtCycleStart: 0,
	maxActivePests: DEFAULT_PEST_MAX_ACTIVE,
	sprayedPlot: true,
	atmosphericFilterAutumn: false,
	pestRepellent: 'none',
	finneganActive: false,
};

export class PestFarmingRateCalculator {
	readonly player: PestFarmingPlayer;
	readonly options: PestFarmingRateOptions;
	readonly priceBook: PestRatePriceBook;
	private phaseStats?: PestRatePhaseStats;

	constructor(input: PestFarmingRateCalculatorInput) {
		this.player = input.player;
		this.options = {
			...input.options,
			intervalSeconds: input.options.intervalSeconds ?? DEFAULT_INTERVAL_SECONDS,
			cycle: normalizeCycleSettings(input.options.cycle),
		};
		this.priceBook = input.priceBook ?? { version: 'empty', missingItemMode: 'exclude' };
	}

	calculate(): PestFarmingRateResult {
		const phaseStats = this.getPhaseStats();
		const stateKey = this.getStateKey(phaseStats);
		const spawnDistribution = this.getSpawnDistribution(phaseStats.spawnBonusPestChance);
		const debug = this.getCycleDebug(phaseStats, spawnDistribution.expectedPestsPerSpawn);
		const farmCrop = this.player.crop.getRates(this.options.crop, debug.farmBlocks);
		const spawnCrop = this.player.spawn.getRates(this.options.crop, debug.spawnBlocks);
		const cropBreaking = sumCropRateResults([farmCrop, spawnCrop]);
		const pestDrops = this.calculatePestDrops(spawnDistribution, phaseStats);
		const intervalScale = (this.options.intervalSeconds ?? DEFAULT_INTERVAL_SECONDS) / debug.cycleSeconds;
		const economy = this.calculateEconomy(spawnDistribution.expectedPestsPerSpawn, debug, intervalScale);
		const perCycle = sumQuantities(
			cropBreaking,
			pestDrops.total,
			economy.pestExchanges,
			economy.pestShards,
			economy.costs,
			economy.feastRareCrops
		);
		const perInterval = scaleQuantities(perCycle, intervalScale);
		const valuation = this.valueQuantities(
			perCycle,
			perInterval,
			{
				cropBreaking,
				pestDrops: pestDrops.total,
				...economy,
			},
			intervalScale
		);

		return {
			options: this.options,
			stateKey,
			debug,
			phaseStats,
			breakdown: {
				cropBreaking: {
					farm: farmCrop,
					spawn: spawnCrop,
					total: cropBreaking,
				},
				pestSpawning: {
					expectedPestsPerSpawn: spawnDistribution.expectedPestsPerSpawn,
					pestsPerInterval:
						spawnDistribution.expectedPestsPerSpawn *
						((this.options.intervalSeconds ?? DEFAULT_INTERVAL_SECONDS) / debug.cycleSeconds),
					distribution: spawnDistribution,
				},
				pestDrops: {
					byPest: pestDrops.byPest,
					total: pestDrops.total,
				},
				timing: debug,
			},
			perCycle,
			perInterval,
			valuation,
		};
	}

	calculateUpgradeImpact(request: PestFarmingUpgradeImpactRequest): PestFarmingUpgradeRateImpact {
		const before = request.before ?? this.calculate();
		const cloned = this.player.clone();
		cloned.applyPhaseUpgrade(request.phase, request.upgrade);
		const after = this.withPlayer(cloned).calculate();
		const delta = diffPestRateResults(before, after);
		const valuationDelta = diffValuation(before.valuation, after.valuation, request.upgradeCostCoins);

		return {
			phase: request.phase,
			upgradeKey: getUpgradeIdentity(request.upgrade),
			before,
			after,
			delta,
			valuationDelta,
		};
	}

	getStateKey(phaseStats = this.getPhaseStats()): string {
		return stableValueKey({
			options: this.options,
			phaseStats,
			phaseLoadouts: this.player.phaseLoadouts,
			armorSets: this.player.armorSetLoadouts,
			sharedEquipment: this.player.sharedEquipment,
			selectedVacuum: this.player.selectedVacuum?.item,
			priceBook: {
				version: this.priceBook.version,
				missingItemMode: this.priceBook.missingItemMode,
			},
		});
	}

	getRequiredPriceItems(result = this.calculate()): string[] {
		return [
			...new Set([
				...Object.keys(result.perInterval.items),
				...Object.keys(result.perInterval.rngItems),
				...Object.keys(result.breakdown.cropBreaking.farm.rngItems ?? {}),
				...Object.keys(result.breakdown.cropBreaking.spawn.rngItems ?? {}),
			]),
		];
	}

	withPlayer(player: PestFarmingPlayer): PestFarmingRateCalculator {
		return new PestFarmingRateCalculator({ player, options: this.options, priceBook: this.priceBook });
	}

	withOptions(options: PestFarmingRateOptions): PestFarmingRateCalculator {
		return new PestFarmingRateCalculator({ player: this.player, options, priceBook: this.priceBook });
	}

	withPriceBook(priceBook: PestRatePriceBook): PestFarmingRateCalculator {
		return new PestFarmingRateCalculator({ player: this.player, options: this.options, priceBook });
	}

	private getPhaseStats(): PestRatePhaseStats {
		if (this.phaseStats) return this.phaseStats;

		const associatedCropFortune = Object.fromEntries(
			Object.values(Crop).map((crop) => [crop, getAssociatedCropFortune(this.player.kill, crop)])
		) as Partial<Record<Crop, number>>;

		this.phaseStats = {
			farmPestCooldownReduction: this.player.getPhaseStat(PestFarmingPhase.Farm, Stat.PestCooldownReduction),
			spawnBonusPestChance: this.player.getPhaseStat(PestFarmingPhase.Spawn, Stat.BonusPestChance),
			killFarmingFortune: this.player.getPhaseStat(PestFarmingPhase.Kill, Stat.FarmingFortune),
			killPestKillFortune: this.player.getPhaseStat(PestFarmingPhase.Kill, Stat.PestKillFortune),
			killOverbloom: this.player.getPhaseStat(PestFarmingPhase.Kill, Stat.Overbloom),
			killDamage: this.player.getPhaseStat(PestFarmingPhase.Kill, Stat.Damage),
			associatedCropFortune,
		};
		return this.phaseStats;
	}

	private getCycleDebug(phaseStats: PestRatePhaseStats, expectedPestsPerSpawn: number): PestCycleDebug {
		const cycle = this.options.cycle;
		const repellentMultiplier = cycle.pestRepellent === 'max' ? 4 : cycle.pestRepellent === 'normal' ? 2 : 1;
		const finneganReduction = cycle.finneganActive ? 20 : 0;
		const cooldownReduction = Math.max(0, Math.min(100, phaseStats.farmPestCooldownReduction + finneganReduction));
		const rawCooldown = 300 * repellentMultiplier * (1 - cooldownReduction / 100);
		const minCooldown = cycle.finneganActive ? 75 : 135;
		const cooldownSeconds = Math.min(1200, Math.max(minCooldown, rawCooldown));
		const spawnBlocksPerSecond = cycle.spawnBlocksPerSecond ?? cycle.blocksPerSecond;
		const spawnChancePerBreak =
			BASE_SPAWN_CHANCE_PER_BREAK *
			(cycle.sprayedPlot ? SPRAYED_PLOT_SPAWN_MULTIPLIER : 1) *
			(cycle.atmosphericFilterAutumn ? ATMOSPHERIC_FILTER_SPAWN_MULTIPLIER : 1) *
			(cycle.spawnChanceMultiplier ?? 1);
		const expectedSpawnWaitSeconds =
			spawnBlocksPerSecond > 0 && spawnChancePerBreak > 0 ? 1 / (spawnBlocksPerSecond * spawnChancePerBreak) : 0;
		const killPhaseSeconds =
			cycle.spawnToKillSwapSeconds +
			cycle.fixedKillSetupSeconds +
			cycle.fixedPestSearchSeconds +
			expectedPestsPerSpawn * cycle.secondsPerPestKill +
			cycle.returnToFarmSeconds;
		const cooldownAfterKillSeconds = Math.max(0, cooldownSeconds - killPhaseSeconds);
		const spawnPreCooldownSeconds = Math.min(cycle.farmSwapBeforeCooldownSeconds, cooldownAfterKillSeconds);
		const farmSeconds = Math.max(0, cooldownAfterKillSeconds - spawnPreCooldownSeconds);
		const spawnWaitSeconds = expectedSpawnWaitSeconds;
		const spawnPhaseSeconds = cycle.farmToSpawnSwapSeconds + spawnPreCooldownSeconds + spawnWaitSeconds;
		const returnToFarmSeconds = cycle.returnToFarmSeconds;
		const cycleSeconds = Math.max(
			1,
			Math.max(cooldownSeconds, killPhaseSeconds + spawnPreCooldownSeconds) +
				cycle.farmToSpawnSwapSeconds +
				spawnWaitSeconds
		);
		const cyclesPerHour = 3600 / cycleSeconds;
		const intervalSeconds = this.options.intervalSeconds ?? DEFAULT_INTERVAL_SECONDS;

		return {
			cooldownSeconds,
			spawnChancePerBreak,
			expectedSpawnWaitSeconds,
			farmSeconds,
			spawnPreCooldownSeconds,
			spawnWaitSeconds,
			spawnPhaseSeconds,
			killPhaseSeconds,
			returnToFarmSeconds,
			cycleSeconds,
			cyclesPerHour,
			intervalsPerHour: 3600 / intervalSeconds,
			farmBlocks: farmSeconds * cycle.blocksPerSecond,
			spawnBlocks: (spawnPreCooldownSeconds + spawnWaitSeconds) * spawnBlocksPerSecond,
		};
	}

	private getSpawnDistribution(bonusPestChance: number): PestSpawnDistribution {
		const cycle = this.options.cycle;
		const availablePestSlots = Math.max(0, cycle.maxActivePests - cycle.activePestsAtCycleStart);
		const guaranteedBeforeCap = 1 + Math.floor(Math.max(0, bonusPestChance) / 100);
		const extraPestChance = (Math.max(0, bonusPestChance) % 100) / 100;
		let expectedPestsPerSpawn = Math.min(availablePestSlots, guaranteedBeforeCap);
		if (guaranteedBeforeCap < availablePestSlots) {
			expectedPestsPerSpawn += extraPestChance;
		}
		const pestTypeWeights = getPestTypeWeights(this.options.attraction);
		const totalWeight = Object.values(pestTypeWeights).reduce((sum, weight) => sum + weight, 0);
		const pestTypeProbabilities = Object.fromEntries(
			Object.entries(pestTypeWeights).map(([pest, weight]) => [pest, totalWeight > 0 ? weight / totalWeight : 0])
		) as Partial<Record<Pest, number>>;

		return {
			availablePestSlots,
			bonusPestChance,
			guaranteedPests: Math.min(availablePestSlots, guaranteedBeforeCap),
			extraPestChance,
			expectedPestsPerSpawn,
			pestTypeWeights,
			pestTypeProbabilities,
		};
	}

	private calculatePestDrops(
		spawnDistribution: PestSpawnDistribution,
		phaseStats = this.getPhaseStats()
	): {
		byPest: Partial<Record<Pest, DetailedPestDropsResult>>;
		total: PestRateQuantities;
	} {
		const byPest: Partial<Record<Pest, DetailedPestDropsResult>> = {};
		let context: PestDropCalculationContext | undefined;
		for (const [pestKey, probability] of Object.entries(spawnDistribution.pestTypeProbabilities)) {
			const pest = pestKey as Pest;
			const expectedPests = spawnDistribution.expectedPestsPerSpawn * (probability ?? 0);
			if (expectedPests <= 0) continue;
			const definition = PEST_DROP_DEFINITIONS[pest];
			if (!definition) continue;
			context ??= this.createPestDropCalculationContext(phaseStats);
			byPest[pest] = this.calculateDropsForPest(definition, expectedPests, context);
		}

		return {
			byPest,
			total: sumQuantities(...Object.values(byPest).map(pestDropsToQuantities)),
		};
	}

	private createPestDropCalculationContext(phaseStats: PestRatePhaseStats): PestDropCalculationContext {
		const kill = this.player.kill;
		const env = kill.buildEnvironment(this.options.crop);
		return {
			farmingFortune: phaseStats.killFarmingFortune,
			pestKillFortune: phaseStats.killPestKillFortune,
			petLuck: this.player.getPhaseStat(PestFarmingPhase.Kill, Stat.PetLuck),
			associatedCropFortune: phaseStats.associatedCropFortune,
			env,
			effects: kill.collectEffects(env),
		};
	}

	private calculateDropsForPest(
		definition: PestDropDefinition,
		expectedPests: number,
		context: PestDropCalculationContext
	): DetailedPestDropsResult {
		const result: DetailedPestDropsResult = {
			pest: definition.pest,
			expectedPests,
			items: {},
			rngItems: {},
			currencies: {},
			collections: {},
			coinSources: {},
			npcCoins: (definition.coinDrops ?? 0) * expectedPests,
		};
		if (result.npcCoins) result.coinSources['Pest Coins'] = result.npcCoins;

		for (const drop of definition.guaranteedDrops) {
			const cropFortune = context.associatedCropFortune[drop.crop] ?? 0;
			const amount =
				calculatePestCropDropAmount({
					baseAmount: drop.baseAmount,
					scalingFortune: drop.scalingFortune,
					farmingFortune: context.farmingFortune,
					cropFortune,
					pestKillFortune: context.pestKillFortune,
					includeCropFortune: definition.pest !== Pest.Mouse,
				}) *
				(drop.chance ?? 1) *
				expectedPests;
			addRecord(result.items, drop.itemId, amount);
			addRecord(result.collections, drop.crop, amount);
		}

		for (const drop of definition.rareDrops ?? []) {
			const crop = definition.guaranteedDrops[0]?.crop ?? this.options.crop;
			const cropFortune = definition.pest === Pest.Mouse ? 0 : (context.associatedCropFortune[crop] ?? 0);
			const petLuck = drop.includesPetLuck ? context.petLuck : 0;
			const fortuneMultiplier =
				drop.affectedByFortune === false
					? 1
					: 1 + (context.farmingFortune + cropFortune + petLuck) / PEST_RARE_DROP_FORTUNE_SCALING;
			const tags = new Set<DropTag>(['pest', 'overbloom']);
			const resolved = resolveDropEffects(context.effects, {
				env: context.env,
				crop,
				dropKind: 'pest',
				itemId: drop.itemId,
				tags,
			});
			const effectMultiplier = (1 + resolved.addRarePct / 100) * resolved.mulRare * resolved.mulDrop;
			const amount = expectedPests * drop.amount * drop.chance * fortuneMultiplier * effectMultiplier;
			if (amount > 0) addRecord(result.rngItems, drop.itemId, amount);
		}

		return result;
	}

	private calculateEconomy(
		expectedPestsPerSpawn: number,
		debug: PestCycleDebug,
		intervalScale: number
	): {
		pestExchanges: PestRateQuantities;
		pestShards: PestRateQuantities;
		costs: PestRateQuantities;
		feastRareCrops: PestRateQuantities;
	} {
		const economy = this.options.economy;
		const pestExchanges = emptyQuantities();
		const pestShards = emptyQuantities();
		const costs = emptyQuantities();
		const feastRareCrops = emptyQuantities();
		if (!economy) return { pestExchanges, pestShards, costs, feastRareCrops };

		const pestsPerCycle = expectedPestsPerSpawn;
		const pestsPerInterval = pestsPerCycle * intervalScale;
		if (economy.pestExchange?.pestsPerItem && economy.pestExchange.pestsPerItem > 0) {
			const reservedPests = economy.pestExchange.reservedPestsPerInterval ?? 0;
			const exchangedPestsPerInterval = Math.max(0, pestsPerInterval - reservedPests);
			const outputPerCycle = exchangedPestsPerInterval / economy.pestExchange.pestsPerItem / intervalScale;
			addRecord(pestExchanges.items, economy.pestExchange.outputItemId, outputPerCycle);
		}

		if (economy.pestShards?.chance && economy.pestShards.chance > 0) {
			const shardChance = economy.pestShards.chance * (1 + Math.max(0, economy.pestShards.fortune) / 100);
			addRecord(pestShards.rngItems, economy.pestShards.itemId, pestsPerCycle * shardChance);
		}

		this.addCost(costs, economy, 'sprayonatorCost', debug.cycleSeconds);
		this.addCost(costs, economy, 'stinkyCheeseCost', debug.cycleSeconds);

		for (const [itemId, quantityPerInterval] of Object.entries(economy.feastRareCrops ?? {})) {
			addRecord(feastRareCrops.rngItems, itemId, quantityPerInterval / intervalScale);
		}

		return { pestExchanges, pestShards, costs, feastRareCrops };
	}

	private addCost(
		costs: PestRateQuantities,
		economy: PestEconomySettings,
		key: 'sprayonatorCost' | 'stinkyCheeseCost',
		cycleSeconds: number
	): void {
		const cost = economy[key];
		if (!cost) return;
		const itemsPerUse = cost.itemsPerUse ?? 1;
		const intervalSeconds = this.options.intervalSeconds ?? DEFAULT_INTERVAL_SECONDS;
		const usesPerInterval =
			cost.usesPerInterval ??
			(cost.durationSeconds && cost.durationSeconds > 0 ? intervalSeconds / cost.durationSeconds : 0);
		if (usesPerInterval <= 0) return;
		addRecord(costs.items, cost.itemId, -(itemsPerUse * usesPerInterval * (cycleSeconds / intervalSeconds)));
	}

	private valueQuantities(
		perCycle: PestRateQuantities,
		perInterval: PestRateQuantities,
		buckets: {
			cropBreaking: PestRateQuantities;
			pestDrops: PestRateQuantities;
			pestExchanges: PestRateQuantities;
			pestShards: PestRateQuantities;
			costs: PestRateQuantities;
			feastRareCrops: PestRateQuantities;
		},
		intervalScale: number
	): PestRateValuationResult {
		const missingItemIds = new Set<string>();
		const missingCurrencyIds = new Set<string>();
		const valueBucket = (quantity: PestRateQuantities, scale = 1) =>
			valueQuantities(quantity, this.priceBook, missingItemIds, missingCurrencyIds) * scale;
		const cropBreaking = valueBucket(buckets.cropBreaking, intervalScale);
		const pestDrops = valueBucket({ ...buckets.pestDrops, rngItems: {}, npcCoins: 0 }, intervalScale);
		const rngDrops = valueBucket(
			{ items: {}, rngItems: buckets.pestDrops.rngItems, currencies: {}, collections: {}, npcCoins: 0 },
			intervalScale
		);
		const pestExchanges = valueBucket(buckets.pestExchanges, intervalScale);
		const pestShards = valueBucket(buckets.pestShards, intervalScale);
		const costs = valueBucket(buckets.costs, intervalScale);
		const feastRareCrops = valueBucket(buckets.feastRareCrops, intervalScale);
		const currencies = valueBucket(
			{ items: {}, rngItems: {}, currencies: perCycle.currencies, collections: {}, npcCoins: 0 },
			intervalScale
		);
		const npcCoins = perInterval.npcCoins;
		const coinsPerInterval = valueQuantities(perInterval, this.priceBook, missingItemIds, missingCurrencyIds);
		const intervalSeconds = this.options.intervalSeconds ?? DEFAULT_INTERVAL_SECONDS;

		return {
			complete: missingItemIds.size === 0 && missingCurrencyIds.size === 0,
			coinsPerCycle: valueQuantities(perCycle, this.priceBook, missingItemIds, missingCurrencyIds),
			coinsPerInterval,
			coinsPerHour: coinsPerInterval * (3600 / intervalSeconds),
			byBucket: {
				cropBreaking,
				pestDrops,
				rngDrops,
				pestExchanges,
				pestShards,
				costs,
				feastRareCrops,
				currencies,
				npcCoins,
			},
			missingItemIds: [...missingItemIds],
			missingCurrencyIds: [...missingCurrencyIds],
		};
	}
}

export function createPestFarmingRateCalculator(input: PestFarmingRateCalculatorInput): PestFarmingRateCalculator {
	return new PestFarmingRateCalculator(input);
}

function normalizeCycleSettings(settings: PestCycleSettings): PestCycleSettings {
	return {
		...DEFAULT_PEST_CYCLE_SETTINGS,
		...settings,
		blocksPerSecond: Math.max(0, settings.blocksPerSecond ?? DEFAULT_PEST_CYCLE_SETTINGS.blocksPerSecond),
		spawnBlocksPerSecond: Math.max(
			0,
			settings.spawnBlocksPerSecond ?? settings.blocksPerSecond ?? DEFAULT_PEST_CYCLE_SETTINGS.blocksPerSecond
		),
		activePestsAtCycleStart: Math.max(0, settings.activePestsAtCycleStart ?? 0),
		maxActivePests: Math.max(1, settings.maxActivePests ?? DEFAULT_PEST_MAX_ACTIVE),
	};
}

function sumCropRateResults(results: DetailedDropsFromEffectsResult[]): PestRateQuantities {
	return sumQuantities(
		...results.map((result) => ({
			items: result.items,
			rngItems: result.rngItems ?? {},
			currencies: result.currencies,
			collections: Object.fromEntries(
				Object.entries(result.items).filter(([itemId]) => Object.values(Crop).includes(itemId as Crop))
			) as Partial<Record<Crop, number>>,
			npcCoins: result.npcCoins,
		}))
	);
}

function pestDropsToQuantities(result: DetailedPestDropsResult): PestRateQuantities {
	return {
		items: result.items,
		rngItems: result.rngItems,
		currencies: result.currencies,
		collections: result.collections,
		npcCoins: result.npcCoins,
	};
}

function sumQuantities(...quantities: PestRateQuantities[]): PestRateQuantities {
	const result = emptyQuantities();
	for (const quantity of quantities) {
		for (const [key, value] of Object.entries(quantity.items)) addRecord(result.items, key, value);
		for (const [key, value] of Object.entries(quantity.rngItems)) addRecord(result.rngItems, key, value);
		for (const [key, value] of Object.entries(quantity.currencies)) addRecord(result.currencies, key, value);
		for (const [key, value] of Object.entries(quantity.collections))
			addRecord(result.collections, key as Crop, value);
		result.npcCoins += quantity.npcCoins;
	}
	return result;
}

function scaleQuantities(quantity: PestRateQuantities, scale: number): PestRateQuantities {
	const scaled = emptyQuantities();
	for (const [key, value] of Object.entries(quantity.items)) scaled.items[key] = value * scale;
	for (const [key, value] of Object.entries(quantity.rngItems)) scaled.rngItems[key] = value * scale;
	for (const [key, value] of Object.entries(quantity.currencies)) scaled.currencies[key] = value * scale;
	for (const [key, value] of Object.entries(quantity.collections)) scaled.collections[key as Crop] = value * scale;
	scaled.npcCoins = quantity.npcCoins * scale;
	return scaled;
}

function emptyQuantities(): PestRateQuantities {
	return {
		items: {},
		rngItems: {},
		currencies: {},
		collections: {},
		npcCoins: 0,
	};
}

function valueQuantities(
	quantity: PestRateQuantities,
	priceBook: PestRatePriceBook,
	missingItemIds: Set<string>,
	missingCurrencyIds: Set<string>
): number {
	let total = quantity.npcCoins;
	for (const [itemId, amount] of [...Object.entries(quantity.items), ...Object.entries(quantity.rngItems)]) {
		const price = priceBook.items?.[itemId]?.coins;
		if (price === undefined) {
			if (priceBook.missingItemMode !== 'zero') missingItemIds.add(itemId);
			continue;
		}
		total += amount * price;
	}
	for (const [currencyId, amount] of Object.entries(quantity.currencies)) {
		const price = priceBook.currencies?.[currencyId];
		if (price === undefined) {
			if (priceBook.missingItemMode !== 'zero') missingCurrencyIds.add(currencyId);
			continue;
		}
		total += amount * price;
	}
	return total;
}

function diffPestRateResults(before: PestFarmingRateResult, after: PestFarmingRateResult): PestFarmingRateDelta {
	const items = diffRecord(before.perInterval.items, after.perInterval.items);
	const rngItems = diffRecord(before.perInterval.rngItems, after.perInterval.rngItems);
	const currencies = diffRecord(before.perInterval.currencies, after.perInterval.currencies);
	const coinSources = {
		'Crop Breaking': after.valuation.byBucket.cropBreaking - before.valuation.byBucket.cropBreaking,
		'Pest Drops': after.valuation.byBucket.pestDrops - before.valuation.byBucket.pestDrops,
		'Rare Pest Drops': after.valuation.byBucket.rngDrops - before.valuation.byBucket.rngDrops,
		'Pest Exchanges': after.valuation.byBucket.pestExchanges - before.valuation.byBucket.pestExchanges,
		'Pest Shards': after.valuation.byBucket.pestShards - before.valuation.byBucket.pestShards,
		'Pest Costs': after.valuation.byBucket.costs - before.valuation.byBucket.costs,
		'Feast Rare Crops': after.valuation.byBucket.feastRareCrops - before.valuation.byBucket.feastRareCrops,
		'Pest Coins': after.valuation.byBucket.npcCoins - before.valuation.byBucket.npcCoins,
	};
	const delta: PestFarmingRateDelta = {
		collection: sumRecord(after.perInterval.collections) - sumRecord(before.perInterval.collections),
		npcCoins: after.valuation.coinsPerHour - before.valuation.coinsPerHour,
		coinSources: Object.fromEntries(Object.entries(coinSources).filter(([, value]) => value !== 0)),
		otherCollection: diffRecord(before.perInterval.collections, after.perInterval.collections),
		items,
		currencies,
		rngItems,
		totalItems: sumRecord(items) + sumRecord(rngItems),
		cycleSeconds: after.debug.cycleSeconds - before.debug.cycleSeconds,
		cyclesPerHour: after.debug.cyclesPerHour - before.debug.cyclesPerHour,
		expectedPestsPerCycle:
			after.breakdown.pestSpawning.expectedPestsPerSpawn - before.breakdown.pestSpawning.expectedPestsPerSpawn,
		pestsPerHour:
			after.breakdown.pestSpawning.pestsPerInterval * after.debug.intervalsPerHour -
			before.breakdown.pestSpawning.pestsPerInterval * before.debug.intervalsPerHour,
	};
	return delta;
}

function diffValuation(
	before: PestRateValuationResult,
	after: PestRateValuationResult,
	upgradeCostCoins?: number
): PestRateValuationDelta {
	const coinsPerHour = after.coinsPerHour - before.coinsPerHour;
	return {
		complete: before.complete && after.complete,
		coinsPerCycle: after.coinsPerCycle - before.coinsPerCycle,
		coinsPerInterval: after.coinsPerInterval - before.coinsPerInterval,
		coinsPerHour,
		costPerCoinsPerHour:
			upgradeCostCoins !== undefined && coinsPerHour > 0 ? upgradeCostCoins / coinsPerHour : undefined,
		missingItemIds: [...new Set([...before.missingItemIds, ...after.missingItemIds])],
	};
}

function getPestTypeWeights(attraction?: PestAttractionSettings): Partial<Record<Pest, number>> {
	const pests = attraction?.includeSpecialPests ? [...NATURAL_PESTS, Pest.Mouse, Pest.LunarMoth] : NATURAL_PESTS;
	const weights: Partial<Record<Pest, number>> = Object.fromEntries(pests.map((pest) => [pest, 1]));
	if (attraction?.selectedPest && weights[attraction.selectedPest] !== undefined)
		weights[attraction.selectedPest] = 12;
	if (attraction?.sprayonatorTarget && weights[attraction.sprayonatorTarget] !== undefined) {
		weights[attraction.sprayonatorTarget] = (weights[attraction.sprayonatorTarget] ?? 1) * 12;
	}
	if (attraction?.hooveriusVinylTarget && weights[attraction.hooveriusVinylTarget] !== undefined) {
		weights[attraction.hooveriusVinylTarget] =
			(weights[attraction.hooveriusVinylTarget] ?? 1) * (attraction.hooveriusVinylMultiplier ?? 2);
	}
	for (const pest of attraction?.excludedPests ?? []) {
		delete weights[pest];
	}
	for (const [pest, multiplier] of Object.entries(attraction?.pestTypeWeightMultipliers ?? {}) as [Pest, number][]) {
		if (weights[pest] !== undefined) weights[pest] = (weights[pest] ?? 1) * multiplier;
	}
	return weights;
}

function diffRecord(
	before: Partial<Record<string, number>>,
	after: Partial<Record<string, number>>
): Record<string, number> {
	const result: Record<string, number> = {};
	for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
		const diff = (after[key] ?? 0) - (before[key] ?? 0);
		if (diff !== 0) result[key] = diff;
	}
	return result;
}

function sumRecord(record: Record<string, number> | Partial<Record<Crop, number>>): number {
	return Object.values(record).reduce((sum, value) => sum + (value ?? 0), 0);
}

function addRecord<T extends string>(record: Partial<Record<T, number>>, key: T, value: number): void {
	if (!value) return;
	record[key] = (record[key] ?? 0) + value;
}

function getUpgradeIdentity(upgrade: FortuneUpgrade): string {
	return (
		upgrade.conflictKey ??
		`${upgrade.title}:${upgrade.action}:${upgrade.meta?.type ?? ''}:${upgrade.meta?.id ?? ''}`
	);
}

function stableValueKey(value: unknown): string {
	if (value === undefined) return 'undefined';
	if (value === null) return 'null';
	if (typeof value === 'number') return Number.isFinite(value) ? value.toFixed(6) : String(value);
	if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
	if (Array.isArray(value)) return `[${value.map((entry) => stableValueKey(entry)).join(',')}]`;
	if (typeof value === 'object') {
		return `{${Object.entries(value)
			.filter(([, entry]) => typeof entry !== 'function' && typeof entry !== 'symbol')
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, entry]) => `${key}:${stableValueKey(entry)}`)
			.join(',')}}`;
	}
	return '';
}
