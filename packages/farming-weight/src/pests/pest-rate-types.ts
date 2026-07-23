import type { Crop } from '../constants/crops.js';
import type { Pest, Spray } from '../constants/pests.js';
import type { SprayonatorTier } from '../constants/specific.js';
import type { FortuneUpgrade } from '../constants/upgrades.js';
import type { PestFarmingPhase, PestFarmingPlayer } from '../player/pestfarmingplayer.js';
import type { DetailedDropsFromEffectsDelta, UpgradeRateImpact } from '../player/player.js';
import type { DetailedDropsFromEffectsResult } from '../util/ratecalc-effects.js';

export type PestRepellentMode = 'none' | 'normal' | 'max';

export interface PestCycleSettings {
	blocksPerSecond: number;
	spawnBlocksPerSecond?: number;
	farmSwapBeforeCooldownSeconds: number;
	farmToSpawnSwapSeconds: number;
	spawnToKillSwapSeconds: number;
	fixedKillSetupSeconds: number;
	fixedPestSearchSeconds: number;
	secondsPerPestKill: number;
	returnToFarmSeconds: number;
	activePestsAtCycleStart: number;
	maxActivePests: number;
	sprayedPlot: boolean;
	atmosphericFilterAutumn: boolean;
	pestRepellent: PestRepellentMode;
	finneganActive: boolean;
	spawnChanceMultiplier?: number;
}

export interface PestAttractionSettings {
	sprayonatorMaterial?: Spray;
	sprayonatorTier?: SprayonatorTier | `${SprayonatorTier}`;
	hooveriusVinylTarget?: Pest;
	includeSpecialPests?: boolean;
	excludedPests?: Pest[];
}

export interface PestExchangeSettings {
	outputItemId: string;
	pestsPerItem: number;
	reservedPestsPerInterval?: number;
}

export interface PestShardSettings {
	itemId: string;
	chance: number;
	fortune: number;
}

export interface PestCostSettings {
	itemId: string;
	itemsPerUse?: number;
	usesPerInterval?: number;
	durationSeconds?: number;
}

export interface PestEconomySettings {
	pestExchange?: PestExchangeSettings;
	pestShards?: PestShardSettings;
	sprayonatorCost?: PestCostSettings;
	stinkyCheeseCost?: PestCostSettings;
	feastRareCrops?: Record<string, number>;
}

export interface PestFarmingRateOptions {
	crop: Crop;
	cycle: PestCycleSettings;
	attraction?: PestAttractionSettings;
	economy?: PestEconomySettings;
	intervalSeconds?: number;
}

export interface PestRateItemPrice {
	coins: number;
	source: 'bazaar' | 'auction' | 'npc' | 'manual';
}

export interface PestRatePriceBook {
	version: string;
	items?: Record<string, PestRateItemPrice>;
	currencies?: Record<string, number>;
	missingItemMode?: 'exclude' | 'zero';
}

export interface PestFarmingRateArmorSelection {
	spawnArmorSetIds?: readonly string[];
}

export interface PestFarmingRateCalculatorInput {
	player: PestFarmingPlayer;
	options: PestFarmingRateOptions;
	priceBook?: PestRatePriceBook;
	armorSelection?: PestFarmingRateArmorSelection;
}

export interface PestCycleDebug {
	cooldownSeconds: number;
	spawnChancePerBreak: number;
	expectedSpawnWaitSeconds: number;
	farmSeconds: number;
	spawnPreCooldownSeconds: number;
	spawnWaitSeconds: number;
	spawnPhaseSeconds: number;
	killPhaseSeconds: number;
	returnToFarmSeconds: number;
	cycleSeconds: number;
	cyclesPerHour: number;
	intervalsPerHour: number;
	farmBlocks: number;
	spawnBlocks: number;
}

export interface PestSpawnDistribution {
	availablePestSlots: number;
	bonusPestChance: number;
	guaranteedPests: number;
	extraPestChance: number;
	expectedPestsPerSpawn: number;
	pestTypeWeights: Partial<Record<Pest, number>>;
	pestTypeProbabilities: Partial<Record<Pest, number>>;
}

export interface PestRatePhaseStats {
	farmPestCooldownReduction: number;
	spawnBonusPestChance: number;
	killFarmingFortune: number;
	killPestKillFortune: number;
	killOverbloom: number;
	killDamage: number;
	associatedCropFortune: Partial<Record<Crop, number>>;
}

export interface PestRateQuantities {
	items: Record<string, number>;
	rngItems: Record<string, number>;
	currencies: Record<string, number>;
	collections: Partial<Record<Crop, number>>;
	npcCoins: number;
}

export interface DetailedPestDropsResult {
	pest: Pest;
	expectedPests: number;
	items: Record<string, number>;
	rngItems: Record<string, number>;
	currencies: Record<string, number>;
	collections: Partial<Record<Crop, number>>;
	coinSources: Record<string, number>;
	npcCoins: number;
}

export interface PestFarmingRateBreakdown {
	cropBreaking: {
		farm: DetailedDropsFromEffectsResult;
		spawn: DetailedDropsFromEffectsResult;
		total: PestRateQuantities;
	};
	pestSpawning: {
		expectedPestsPerSpawn: number;
		pestsPerInterval: number;
		distribution: PestSpawnDistribution;
	};
	pestDrops: {
		byPest: Partial<Record<Pest, DetailedPestDropsResult>>;
		total: PestRateQuantities;
	};
	economy: {
		pestExchanges: PestRateQuantities;
		pestShards: PestRateQuantities;
		costs: PestRateQuantities;
		feastRareCrops: PestRateQuantities;
	};
	timing: PestCycleDebug;
}

export interface PestRateValuationResult {
	complete: boolean;
	coinsPerCycle: number;
	coinsPerInterval: number;
	coinsPerHour: number;
	byBucket: {
		cropBreaking: number;
		pestDrops: number;
		rngDrops: number;
		pestExchanges: number;
		pestShards: number;
		costs: number;
		feastRareCrops: number;
		currencies: number;
		npcCoins: number;
	};
	missingItemIds: string[];
	missingCurrencyIds: string[];
}

export interface PestFarmingRateResult {
	options: PestFarmingRateOptions;
	mechanicsKey: string;
	stateKey: string;
	debug: PestCycleDebug;
	phaseStats: PestRatePhaseStats;
	breakdown: PestFarmingRateBreakdown;
	perCycle: PestRateQuantities;
	perInterval: PestRateQuantities;
	valuation: PestRateValuationResult;
}

export interface PestFarmingUpgradeImpactRequest {
	phase: PestFarmingPhase;
	upgrade: FortuneUpgrade;
	before?: PestFarmingRateResult;
	upgradeCostCoins?: number;
}

export interface PestFarmingRateDelta extends DetailedDropsFromEffectsDelta {
	cycleSeconds: number;
	cyclesPerHour: number;
	expectedPestsPerCycle: number;
	pestsPerHour: number;
}

export interface PestRateValuationDelta {
	complete: boolean;
	coinsPerCycle: number;
	coinsPerInterval: number;
	coinsPerHour: number;
	costPerCoinsPerHour?: number;
	missingItemIds: string[];
	missingCurrencyIds: string[];
}

export interface PestFarmingUpgradeRateImpact
	extends UpgradeRateImpact<PestFarmingRateResult, PestFarmingRateResult, PestFarmingRateDelta> {
	phase: PestFarmingPhase;
	upgradeKey: string;
	valuationDelta: PestRateValuationDelta;
}
