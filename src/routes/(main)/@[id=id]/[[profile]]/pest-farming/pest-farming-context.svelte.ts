import { trackAnalytics } from '$lib/analytics';
import type { RatesItemPriceData } from '$lib/api/elite';
import { PROPER_CROP_TO_API_CROP } from '$lib/constants/crops';
import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
import { getLevelProgress } from '$lib/format';
import { getItemsFromUpgrades } from '$lib/items';
import { getBestItemSellPrice, type ItemSellPrice } from '$lib/rates/item-sell-price';
import {
	clonePestLoadoutState,
	importPestLoadouts,
	type PestLoadoutProfileState,
	type StoredPestArmorSet,
	type StoredPestEquipmentSet,
	type StoredPestLoadoutPreset,
} from '$lib/rates/pest-loadouts';
import { findPestPetPurchaseRecommendations, type PestPetPurchaseRecommendation } from '$lib/rates/pest-pet-purchase';
import { shouldDisplayPestUpgrade } from '$lib/rates/pest-upgrade-visibility';
import { getHarvestFeast } from '$lib/remote/harvest-feast.remote';
import { getItems } from '$lib/remote/items.remote';
import {
	getRatesData,
	type PestFarmingData,
	type PestFarmingRateSettings,
	type PestFarmingTimeOfDay,
	type RatesData,
} from '$lib/stores/ratesData';
import { DEFAULT_SELECTED_CROPS, getSelectedCrops } from '$lib/stores/selectedCrops';
import { getStatsContext } from '$lib/stores/stats.svelte';
import {
	createPestFarmingPlayer,
	createPestPhaseLoadoutComparisonTasks,
	Crop,
	CROP_INFO,
	DEFAULT_PEST_CYCLE_SETTINGS,
	FARMING_PET_ITEMS,
	FarmingArmor,
	FarmingEquipment,
	FarmingPet,
	FarmingTool,
	findPestGearPieceConflict,
	findSecondHelianthusSetRecommendation,
	GearSlot,
	getCompletionUpgradeKey,
	getCropFromName,
	getCropMilestoneLevels,
	getCropUpgrades,
	getFarmingPetId,
	getFortuneUpgradeIdentity,
	getGardenLevel,
	getProfitCompletionUpgrades,
	optimizePestLoadouts,
	PEST_ARMOR_SLOTS,
	PEST_EQUIPMENT_SLOTS,
	PEST_FARMING_PHASE_MECHANICS,
	PEST_FARMING_PHASE_STATS,
	PEST_FARMING_STATS,
	PestFarmingPhase,
	PestFarmingRateCalculator,
	resolveProfitAwareProgress,
	SprayonatorTier,
	Stat,
	STAT_NAMES,
	Vacuum,
	VACUUM_STATS,
	type EliteItemDto,
	type FortuneSourceProgress,
	type FortuneUpgrade,
	type PestArmorSetLoadout,
	type PestAttractionSettings,
	type PestCycleSettings,
	type PestEquipmentSetLoadout,
	type PestFarmingPlayerOptions,
	type PestFarmingUpgradeRateImpact,
	type PestGearPieceConflict,
	type PestLoadoutPreset,
	type PestRateItemPrice,
	type PestRatePriceBook,
	type SecondHelianthusSetRecommendation,
	type StatBreakdown,
	type TemporaryFarmingFortune,
	type UpgradeTreeNode,
} from 'farming-weight';
import { onMount, untrack } from 'svelte';
import { fromStore } from 'svelte/store';
import { cachePestPrices, PestRateImpactController, readCachedPestPrices } from './pest-rate-impact-controller.svelte';

export const PHASE_CONFIG = [
	{
		phase: PestFarmingPhase.Farm,
		label: 'Farm',
		title: 'Farm Phase',
		description: 'Normal farming while you wait for your pest cooldown to run out!',
		progress: 'Farm Sources',
	},
	{
		phase: PestFarmingPhase.Spawn,
		label: 'Spawn',
		title: 'Spawn Phase',
		description: 'Maximize bonus pest chance right before pests spawn!',
		progress: 'Bonus Pest Chance Progress',
	},
	{
		phase: PestFarmingPhase.Kill,
		label: 'Kill',
		title: 'Kill Phase',
		description: 'Use your vacuum and best farming fortune and overbloom setup!',
		progress: 'Kill Sources',
	},
] as const;

const PEST_UPGRADE_TREE_MAX_DEPTH = 4;
const RECOMMENDATION_FRAME_BUDGET_MS = 8;
const RATE_SETTINGS_DEBOUNCE_MS = 150;

const cropKey = (crop: string) =>
	(PROPER_CROP_TO_API_CROP[crop as keyof typeof PROPER_CROP_TO_API_CROP] ??
		getCropFromName(crop) ??
		Crop.Wheat) as Crop;

const sumStatBreakdown = (breakdown: StatBreakdown): number =>
	Object.values(breakdown).reduce((sum, entry) => sum + entry.value, 0);

function nextBrowserFrame(): Promise<void> {
	return new Promise((resolve) => {
		if (globalThis.requestAnimationFrame) globalThis.requestAnimationFrame(() => resolve());
		else globalThis.setTimeout(resolve, 0);
	});
}

function createFrameBudgetYield(frameBudgetMs = RECOMMENDATION_FRAME_BUDGET_MS): () => Promise<void> {
	let frameStartedAt = globalThis.performance?.now() ?? Date.now();
	return async () => {
		const now = globalThis.performance?.now() ?? Date.now();
		if (now - frameStartedAt < frameBudgetMs) return;
		await nextBrowserFrame();
		frameStartedAt = globalThis.performance?.now() ?? Date.now();
	};
}

type PestFarmingPlayer = ReturnType<typeof createPestFarmingPlayer>;
const BASE_CROP_ITEM_IDS = new Set<string>(Object.values(Crop));
const STATIC_NPC_ITEM_PRICES: Record<string, PestRateItemPrice> = {
	'SLUG;3': { coins: 500_000, source: 'npc' },
	'SLUG;4': { coins: 5_000_000, source: 'npc' },
};
const MECHANICS_PRICE_BOOK: PestRatePriceBook = {
	version: 'mechanics',
	missingItemMode: 'exclude',
};

function getLockedPestTimeOfDay(crop: Crop): PestFarmingTimeOfDay | undefined {
	if (crop === Crop.Sunflower) return 'day';
	if (crop === Crop.Moonflower) return 'night';
	return undefined;
}

export class PestFarmingPageContext {
	readonly ctx = getStatsContext();

	#ratesData = getRatesData();
	#selectedCrops = getSelectedCrops();
	#harvestFeast = getHarvestFeast();
	#rates = fromStore(this.#ratesData);
	#selectedCropValues = fromStore(this.#selectedCrops);

	rates = $derived(this.#rates.current);
	pestVersion = $state(0);
	selectedVacuumId = $state('');
	loadoutState = $state<PestLoadoutProfileState>();
	optimizationRunning = $state(false);
	initialOptimizationPending = $state(false);
	calculationsSettled = $state(false);
	optimizationEvaluated = $state(0);
	optimizationPass = $state(0);
	activePhase = $state<PestFarmingPhase>(PestFarmingPhase.Farm);
	itemsData = $state<RatesItemPriceData>({});
	itemsVersion = $state(0);
	itemPricesReady = $state(false);
	itemPriceLoadFailed = $state(false);
	secondHelianthusSetRecommendation = $state<SecondHelianthusSetRecommendation>();
	secondHelianthusSetRevision = $state(0);
	secondHelianthusSetRecommendationRunning = $state(false);
	petPurchaseRecommendations = $state<PestPetPurchaseRecommendation[]>([]);
	petPurchaseRevision = $state(0);
	petPurchaseRecommendationsRunning = $state(false);
	calculationPestRateSettings = $state<PestCycleSettings>({ ...DEFAULT_PEST_CYCLE_SETTINGS });
	readonly rateImpacts = new PestRateImpactController();
	calculationsRunning = $derived(
		!this.itemPriceLoadFailed &&
			(!this.rateImpacts.ready ||
				!this.itemPricesReady ||
				this.initialOptimizationPending ||
				this.optimizationRunning ||
				this.secondHelianthusSetRecommendationRunning ||
				this.petPurchaseRecommendationsRunning)
	);

	#skipNextRatesDataRefresh = false;
	#profileKey = '';
	#lastItemRequestKey = '';
	#itemPriceLoadRevision = 0;
	#loadoutImportKey = '';
	#optimizationRevision = 0;
	#secondHelianthusSetGeneration = 0;
	#secondHelianthusSetKey = '';
	#petPurchaseGeneration = 0;
	#petPurchaseKey = '';
	#calculationPestRateSettingsKey = '';
	#pendingPestRateSettingsKey = '';
	#pendingRateSettingAnalyticsKeys = new Set<keyof PestFarmingRateSettings>();
	#rateSettingsTimer: ReturnType<typeof setTimeout> | undefined;
	#needsInitialOptimization = false;

	pets = $derived.by(() => (this.ctx.ready ? FarmingPet.fromArray(this.ctx.pets) : []));
	tools = $derived.by(() => (this.ctx.ready ? FarmingTool.fromArray(this.ctx.tools as EliteItemDto[]) : []));
	vacuums = $derived.by(() => (this.ctx.ready ? Vacuum.fromArray(this.ctx.tools as EliteItemDto[]) : []));
	armor = $derived.by(() => (this.ctx.ready ? FarmingArmor.fromArray(this.ctx.armor as EliteItemDto[]) : []));
	equipment = $derived.by(() =>
		this.ctx.ready ? FarmingEquipment.fromArray(this.ctx.equipment as EliteItemDto[]) : []
	);

	selectedCropName = $derived(
		Object.entries(this.#selectedCropValues.current).find(([, value]) => value)?.[0] ?? 'Wheat'
	);
	selectedCropKey = $derived(cropKey(this.selectedCropName));
	selectedVacuum = $derived(
		this.vacuums.find((vacuum) => vacuum.item.uuid === this.selectedVacuumId) ?? this.vacuums[0]
	);
	lockedPestTimeOfDay = $derived(getLockedPestTimeOfDay(this.selectedCropKey));
	pestTimeOfDay = $derived(this.lockedPestTimeOfDay ?? this.rates.pestFarming.timeOfDay);
	pestAttraction = $derived.by<PestAttractionSettings>(() => {
		const settings = this.rates.pestFarming.attraction;
		const isHooverius = this.selectedVacuum?.item.skyblockId === 'INFINI_VACUUM_HOOVERIUS';

		return {
			...settings,
			sprayonatorMaterial: this.rates.pestFarming.sprayedPlot ? settings.sprayonatorMaterial : undefined,
			sprayonatorTier: this.rates.pestFarming.sprayonatorTier,
			hooveriusVinylTarget: isHooverius ? settings.hooveriusVinylTarget : undefined,
			timeOfDay: this.pestTimeOfDay,
		};
	});
	pestRateSettings = $derived.by<PestCycleSettings>(() => ({
		...DEFAULT_PEST_CYCLE_SETTINGS,
		...this.rates.pestFarming.rateSettings,
		sprayedPlot: this.rates.pestFarming.sprayedPlot,
	}));
	pestRatePriceBook = $derived.by<PestRatePriceBook>(() => {
		void this.itemsVersion;
		return {
			version: String(this.itemsVersion),
			missingItemMode: 'exclude',
			items: {
				...STATIC_NPC_ITEM_PRICES,
				...Object.fromEntries(
					Object.entries(this.itemsData)
						.map(
							([itemId, item]) =>
								[itemId, getBestItemSellPrice(item, !BASE_CROP_ITEM_IDS.has(itemId))] as const
						)
						.filter((entry): entry is readonly [string, ItemSellPrice] => entry[1] !== undefined)
				),
			},
		};
	});
	pestRateCalculator = $derived.by(() => {
		this.trackPestVersion();
		return this.#createRateCalculator(this.pestPlayer, MECHANICS_PRICE_BOOK);
	});
	pestRateMechanicsResult = $derived.by(() => this.pestRateCalculator.calculate());
	pestRateResult = $derived.by(() =>
		this.pestRateCalculator.revalueResult(this.pestRateMechanicsResult, this.pestRatePriceBook)
	);
	pestRateMechanicsKey = $derived(this.pestRateMechanicsResult.mechanicsKey);
	pestRateStateKey = $derived(this.pestRateResult.stateKey);
	pestRatePathVersion = $derived(`${this.activePhase}:${this.pestRateMechanicsKey}`);
	pestRateVersion = $derived(
		`${this.pestRatePathVersion}:${this.itemsVersion}:${this.rateImpacts.displayRevision}:${this.secondHelianthusSetRevision}:${this.petPurchaseRevision}`
	);

	harvestFeastPerks = $derived.by(() => {
		const current = this.ctx.member.current?.stats?.carnival?.harvestFeast;
		if (!current) return undefined;

		return {
			natural_talent: current.naturalTalent,
			fortunate_feasting: current.fortunateFeasting,
			feast_crashers: current.feastCrashers,
		};
	});

	harvestFeastOptions = $derived.by<PestFarmingPlayerOptions['harvestFeast']>(() => {
		const current = this.#harvestFeast.current;
		const inSeasonCrops = (current?.current?.crops ?? [])
			.map((crop) => cropKey(crop))
			.filter((crop) => crop !== undefined);

		return {
			active: inSeasonCrops.length > 0,
			inSeasonCrops,
			grandFeast: current?.isGrandFeast ?? false,
			perks: this.harvestFeastPerks,
		};
	});

	options: PestFarmingPlayerOptions = {} as PestFarmingPlayerOptions;
	pestPlayer: PestFarmingPlayer = createPestFarmingPlayer({} as PestFarmingPlayerOptions);

	activePhaseConfig = $derived(PHASE_CONFIG.find((config) => config.phase === this.activePhase) ?? PHASE_CONFIG[0]);
	activeLoadoutPreset = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getPhasePreset(this.activePhase);
	});
	activePhaseLoadout = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.phaseLoadouts[this.activePhase];
	});
	activeArmorSet = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getArmorSetModel(this.activePhaseLoadout.armorSetId);
	});
	activeEquipmentSet = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getEquipmentSetModel(this.activePhaseLoadout.equipmentSetId);
	});
	activePhasePlayer = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getPhasePlayer(this.activePhase);
	});
	activePhasePet = $derived(
		this.activePhasePlayer.pets.find((pet) => getFarmingPetId(pet) === this.activePhaseLoadout.petId)
	);

	pestStats = $derived.by(() => {
		this.trackPestVersion();
		const cropStat = CROP_INFO[this.selectedCropKey]?.fortuneType ?? Stat.FarmingFortune;
		return this.getPhaseStats(this.activePhase).map((stat) => {
			if (this.activePhase === PestFarmingPhase.Spawn && stat === Stat.BonusPestChance) {
				const breakdown = Object.fromEntries(
					Object.entries(this.pestRateMechanicsResult.phaseStats.spawnBonusPestChanceBreakdown).map(
						([source, value]) => [source, { value, stat }]
					)
				);
				return {
					stat,
					total: this.pestRateMechanicsResult.phaseStats.spawnBonusPestChance,
					breakdown,
				};
			}
			const combinedBreakdown = this.pestPlayer.getPhaseStatBreakdown(
				this.activePhase,
				stat,
				this.selectedCropKey
			);
			const breakdown =
				stat === cropStat && cropStat !== Stat.FarmingFortune
					? Object.fromEntries(
							Object.entries(combinedBreakdown).filter(([, entry]) => entry.stat === cropStat)
						)
					: combinedBreakdown;
			return {
				stat,
				total: sumStatBreakdown(breakdown),
				breakdown,
			};
		});
	});

	cropFortune = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.crop.getCropFortune(this.selectedCropKey);
	});

	tempFortune = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.crop.tempFortune;
	});

	tempFortuneBreakdown = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.crop.tempFortuneBreakdown;
	});

	cropContextStats = $derived.by(() => {
		const cropStat = CROP_INFO[this.selectedCropKey]?.fortuneType ?? Stat.FarmingFortune;
		return cropStat === Stat.FarmingFortune
			? [Stat.FarmingFortune, Stat.Overbloom]
			: [cropStat, Stat.FarmingFortune, Stat.Overbloom];
	});

	cropContextSummary = $derived.by(() => {
		this.trackPestVersion();
		const cropStat = CROP_INFO[this.selectedCropKey]?.fortuneType ?? Stat.FarmingFortune;
		return this.cropContextStats.map((stat) => {
			const combinedBreakdown = this.pestPlayer.crop.getStatBreakdown(stat, this.selectedCropKey);
			const breakdown =
				stat === cropStat && cropStat !== Stat.FarmingFortune
					? Object.fromEntries(
							Object.entries(combinedBreakdown).filter(([, entry]) => entry.stat === cropStat)
						)
					: combinedBreakdown;
			return {
				stat,
				total: sumStatBreakdown(breakdown),
				breakdown,
			};
		});
	});

	rawCropProgress = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getCropProgress(this.selectedCropKey, this.cropContextStats);
	});

	rawActiveEquipmentSetProgress = $derived.by(() => {
		this.trackPestVersion();
		return this.activePhaseLoadout.equipmentSetId
			? this.pestPlayer.getEquipmentSetProgress(
					this.activePhaseLoadout.equipmentSetId,
					this.getPhaseStats(this.activePhase)
				)
			: [];
	});

	rawActiveArmorSetProgress = $derived.by(() => {
		this.trackPestVersion();
		return this.activePhaseLoadout.armorSetId
			? this.pestPlayer.getArmorSetProgress(
					this.activePhaseLoadout.armorSetId,
					this.getPhaseStats(this.activePhase)
				)
			: [];
	});

	rawActivePhaseGeneralProgress = $derived.by(() => {
		this.trackPestVersion();
		const stats = this.getPhaseStats(this.activePhase);
		const mechanics = PEST_FARMING_PHASE_MECHANICS[this.activePhase];
		const progress = this.pestPlayer.getPhaseProgress(this.activePhase, stats, mechanics);
		const hasRelevantStat = (p: FortuneSourceProgress) =>
			(!!p.stats &&
				Object.entries(p.stats).some(
					([stat, sp]) => stats.includes(stat as Stat) && (sp.current > 0 || sp.max > 0)
				)) ||
			p.effects?.some((effect) => effect.mechanic && mechanics.includes(effect.mechanic));
		return progress.filter((p) => hasRelevantStat(p) || p.progress?.some(hasRelevantStat));
	});

	rawVacuumProgress = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getVacuumProgress(VACUUM_STATS);
	});

	completionProgressUpgrades = $derived(
		getProfitCompletionUpgrades([
			...this.rawCropProgress,
			...this.rawActiveEquipmentSetProgress,
			...this.rawActiveArmorSetProgress,
			...this.rawActivePhaseGeneralProgress,
			...(this.activePhase === PestFarmingPhase.Kill ? this.rawVacuumProgress : []),
		])
	);

	completionRateImpacts = $derived.by(() => {
		const result = new Map<string, PestFarmingUpgradeRateImpact>();
		const before = this.pestRateMechanicsResult;
		for (const upgrade of this.completionProgressUpgrades) {
			result.set(
				getCompletionUpgradeKey(upgrade),
				this.pestRateCalculator.calculateUpgradeImpact({
					phase: this.activePhase,
					upgrade,
					before,
				})
			);
		}
		return result;
	});

	completionRateItems = $derived.by(() => {
		const result = new Set<string>();
		for (const impact of this.completionRateImpacts.values()) {
			for (const itemId of this.pestRateCalculator.getRequiredPriceItems(impact.after)) result.add(itemId);
		}
		return [...result];
	});

	cropProgress = $derived.by(() => {
		void this.itemsVersion;
		return resolveProfitAwareProgress(this.rawCropProgress, (upgrade) => this.#getCompletionComparison(upgrade));
	});
	activeEquipmentSetProgress = $derived.by(() => {
		void this.itemsVersion;
		return resolveProfitAwareProgress(this.rawActiveEquipmentSetProgress, (upgrade) =>
			this.#getCompletionComparison(upgrade)
		);
	});
	activeArmorSetProgress = $derived.by(() => {
		void this.itemsVersion;
		return resolveProfitAwareProgress(this.rawActiveArmorSetProgress, (upgrade) =>
			this.#getCompletionComparison(upgrade)
		);
	});
	activePhaseGeneralProgress = $derived.by(() => {
		void this.itemsVersion;
		return resolveProfitAwareProgress(this.rawActivePhaseGeneralProgress, (upgrade) =>
			this.#getCompletionComparison(upgrade)
		);
	});
	vacuumProgress = $derived.by(() => {
		void this.itemsVersion;
		return resolveProfitAwareProgress(this.rawVacuumProgress, (upgrade) => this.#getCompletionComparison(upgrade));
	});

	activePhaseUpgrades = $derived.by(() => {
		this.trackPestVersion();
		const upgrades = this.pestPlayer.getPhaseUpgrades(this.activePhase, {
			stats: this.getPhaseStats(this.activePhase),
			mechanics: PEST_FARMING_PHASE_MECHANICS[this.activePhase],
			includeUpgradeGroups: true,
		});
		const secondSet = this.secondHelianthusSetRecommendation;
		const petPurchases = this.petPurchaseRecommendations
			.filter((recommendation) => recommendation.primaryPhase === this.activePhase)
			.map((recommendation) => recommendation.upgrade);
		const recommendedPetConflicts = new Set(petPurchases.map((upgrade) => upgrade.conflictKey).filter(Boolean));
		return [
			...upgrades.filter((upgrade) => !recommendedPetConflicts.has(upgrade.conflictKey)),
			...(secondSet?.primaryPhase === this.activePhase ? [secondSet.upgrade] : []),
			...petPurchases,
		];
	});

	displayedActivePhaseUpgrades = $derived.by(() => {
		void this.rateImpacts.displayRevision;
		return this.activePhaseUpgrades.filter((upgrade) =>
			shouldDisplayPestUpgrade(upgrade, this.getPestRateImpact(upgrade))
		);
	});

	visibleProgressUpgrades = $derived.by(() => {
		this.trackPestVersion();
		const progress = [
			...this.rawCropProgress,
			...this.rawActiveEquipmentSetProgress,
			...this.rawActiveArmorSetProgress,
			...this.rawActivePhaseGeneralProgress,
			...(this.activePhase === PestFarmingPhase.Kill ? this.rawVacuumProgress : []),
		];
		return progress.flatMap((entry) => this.#getRawProgressUpgrades(entry));
	});

	neededItemUpgrades = $derived.by(() => {
		this.trackPestVersion();
		return [...this.visibleProgressUpgrades, ...this.activePhaseUpgrades];
	});

	rateOutputItems = $derived.by(() => this.pestRateCalculator.getRequiredPriceItems(this.pestRateMechanicsResult));

	neededItems = $derived([
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		...new Set([
			'PET',
			...Object.keys(FARMING_PET_ITEMS),
			...getItemsFromUpgrades(this.neededItemUpgrades),
			...this.rateOutputItems,
			...this.completionRateItems,
			...this.rateImpacts.requiredItemIds,
		]),
	]);

	constructor() {
		this.#commitCalculationPestRateSettings(this.pestRateSettings);
		this.options = this.#buildOptions({});
		this.refreshPestPlayer();

		$effect(() => this.#scheduleCalculationPestRateSettings(this.pestRateSettings));
		$effect(() => this.#scheduleRateImpacts());
		$effect(() => this.#revalueRateImpacts());
		$effect(() => this.#loadItemPrices());
		$effect(() => this.#syncExternalState());
		$effect(() => this.#syncSelectedCrop());
		$effect(() => this.#syncVacuumSelection());
		$effect(() => this.#syncInitialOptimization());
		$effect(() => this.#scheduleSecondHelianthusSetRecommendation());
		$effect(() => this.#schedulePetPurchaseRecommendations());
		$effect(() => {
			if (this.loadoutState && !this.calculationsRunning) this.calculationsSettled = true;
		});

		onMount(() => {
			this.#restoreSavedCrop();
			return () => {
				if (this.#rateSettingsTimer !== undefined) clearTimeout(this.#rateSettingsTimer);
				this.rateImpacts.cancel();
			};
		});
	}

	refreshPestPlayer() {
		this.pestPlayer = createPestFarmingPlayer(this.options);
		this.selectedVacuumId = this.pestPlayer.selectedVacuum?.item.uuid ?? this.selectedVacuumId;
		this.pestVersion++;
	}

	refreshPestPlayerWith(patch: Partial<PestFarmingPlayerOptions>): void {
		this.options = { ...this.pestPlayer.getOptionsSnapshot(), ...patch } as PestFarmingPlayerOptions;
		this.refreshPestPlayer();
	}

	#getProfileKey(): string {
		return `${this.ctx.uuid}:${this.ctx.selectedProfile?.profileId ?? ''}`;
	}

	#resetSessionSelections(): void {
		this.cancelLoadoutOptimization();
		this.#secondHelianthusSetGeneration++;
		this.#secondHelianthusSetKey = '';
		this.secondHelianthusSetRecommendation = undefined;
		this.secondHelianthusSetRevision++;
		this.secondHelianthusSetRecommendationRunning = false;
		this.#petPurchaseGeneration++;
		this.#petPurchaseKey = '';
		this.petPurchaseRecommendations = [];
		this.petPurchaseRevision++;
		this.petPurchaseRecommendationsRunning = false;
		this.selectedVacuumId = '';
		this.loadoutState = undefined;
		this.initialOptimizationPending = false;
		this.calculationsSettled = false;
	}

	#loadProfileLoadouts(): boolean {
		if (!this.ctx.farmingInventory.current) return false;
		const imported = importPestLoadouts({
			armor: this.ctx.armor,
			equipment: this.ctx.equipment,
			pets: this.ctx.pets,
			loadouts: this.ctx.member.current?.memberData?.loadouts ?? [],
		});
		this.loadoutState = clonePestLoadoutState(imported);
		this.#needsInitialOptimization = true;
		this.initialOptimizationPending = true;
		this.calculationsSettled = false;
		return true;
	}

	#getLoadoutImportKey(): string {
		return JSON.stringify({
			profile: this.#getProfileKey(),
			armor: this.ctx.armor.map((item) => [item.uuid, item.slot]),
			equipment: this.ctx.equipment.map((item) => [item.uuid, item.slot]),
			pets: this.ctx.pets.map((pet) => [pet.uuid, pet.localId, pet.type, pet.exp, pet.heldItem]),
			loadouts: this.ctx.member.current?.memberData?.loadouts ?? [],
		});
	}

	#syncInitialOptimization(): void {
		void this.pestRatePriceBook.version;
		void this.rateImpacts.ready;
		void this.itemsVersion;
		if (
			!this.#needsInitialOptimization ||
			this.optimizationRunning ||
			!this.loadoutState ||
			!this.rateImpacts.ready ||
			!this.itemPricesReady
		) {
			return;
		}
		this.#needsInitialOptimization = false;
		const profileKey = this.#getProfileKey();
		untrack(() => {
			void this.optimizeLoadouts().finally(() => {
				if (profileKey === this.#getProfileKey() && !this.#needsInitialOptimization) {
					this.initialOptimizationPending = false;
				}
			});
		});
	}

	trackPestVersion(): number {
		return this.pestVersion;
	}

	getPieceBreakdown(
		piece: FarmingArmor | FarmingEquipment,
		stats: readonly Stat[] = PEST_FARMING_STATS
	): StatBreakdown {
		const breakdown: StatBreakdown = {};
		const cropStat = CROP_INFO[this.selectedCropKey]?.fortuneType;
		const statList: readonly Stat[] = cropStat && !stats.includes(cropStat) ? [...stats, cropStat] : stats;
		for (const stat of statList) {
			for (const [source, entry] of Object.entries(piece.getStatBreakdown(stat, this.selectedCropKey))) {
				let key = source;
				if (breakdown[key] && breakdown[key].stat !== entry.stat) {
					key = `${source} (${STAT_NAMES[entry.stat]})`;
				}

				if (breakdown[key]) {
					breakdown[key] = {
						...breakdown[key],
						value: breakdown[key].value + entry.value,
					};
				} else {
					breakdown[key] = { ...entry };
				}
			}
		}
		return breakdown;
	}

	getPhaseStats(phase: PestFarmingPhase): Stat[] {
		const stats = PEST_FARMING_PHASE_STATS[phase];
		if (phase === PestFarmingPhase.Spawn) return stats;

		const cropStat = CROP_INFO[this.selectedCropKey]?.fortuneType;
		if (!cropStat || stats.includes(cropStat)) return stats;

		return [...stats, cropStat];
	}

	getPhasePieceBreakdown(piece: FarmingArmor | FarmingEquipment): StatBreakdown {
		return this.getPieceBreakdown(piece, this.getPhaseStats(this.activePhase));
	}

	getActiveEquipmentPieceBreakdown(piece: FarmingArmor | FarmingEquipment): StatBreakdown {
		return this.getPieceBreakdown(piece, this.getPhaseStats(this.activePhase));
	}

	getPhasePieceRateImpact(piece: FarmingArmor | FarmingEquipment): number | undefined {
		const slot = piece.slot;
		const uuid = piece.item.uuid;
		const armorSetId = this.activePhaseLoadout.armorSetId;
		if (!slot || !uuid) return 0;
		if (this.pestPlayer.getArmorSetLoadout(armorSetId)?.pieces[slot] === uuid) return 0;

		return this.rateImpacts.gearImpacts.get(`armor:${armorSetId}:${slot}:${uuid}`);
	}

	getActiveEquipmentPieceRateImpact(piece: FarmingArmor | FarmingEquipment): number | undefined {
		const slot = piece.slot;
		const uuid = piece.item.uuid;
		const equipmentSetId = this.activePhaseLoadout.equipmentSetId;
		if (!slot || !uuid) return 0;
		if (this.pestPlayer.getEquipmentSetLoadout(equipmentSetId)?.pieces[slot] === uuid) return 0;

		return this.rateImpacts.gearImpacts.get(`equipment:${equipmentSetId}:${slot}:${uuid}`);
	}

	getPetBreakdown(pet: FarmingPet, phase: PestFarmingPhase): StatBreakdown {
		const breakdown: StatBreakdown = {};
		const phaseStats = this.getPhaseStats(phase);
		const stats: readonly Stat[] = phaseStats.includes(Stat.FarmingFortune)
			? phaseStats
			: [...phaseStats, Stat.FarmingFortune];
		const phasePlayer = this.pestPlayer.getPhasePlayer(phase);
		for (const [source, entry] of Object.entries(pet.getFullBreakdown(phasePlayer))) {
			if (stats.includes(entry.stat)) breakdown[source] = { ...entry };
		}
		return breakdown;
	}

	getPetRateImpact(pet: FarmingPet, phase: PestFarmingPhase): number | undefined {
		const uuid = getFarmingPetId(pet);
		if (!uuid) return 0;
		if (this.pestPlayer.phaseLoadouts[phase]?.petId === uuid) return 0;

		return this.rateImpacts.petImpacts.get(`pet:${phase}:${uuid}`);
	}

	getProgressUpgrades(progress: FortuneSourceProgress): FortuneUpgrade[] {
		void this.rateImpacts.displayRevision;
		return this.#getRawProgressUpgrades(progress).filter((upgrade) =>
			shouldDisplayPestUpgrade(upgrade, this.getPestRateImpact(upgrade))
		);
	}

	#getRawProgressUpgrades(progress: FortuneSourceProgress): FortuneUpgrade[] {
		const uuid = progress.item?.uuid;
		if (!uuid) return progress.upgrades ?? [];

		const tool = this.pestPlayer.crop.tools.find((item) => item.item.uuid === uuid);
		if (tool && this.activePhase === PestFarmingPhase.Kill) return [];
		if (tool) return tool.getUpgrades({ stats: this.cropContextStats });

		const vacuum = this.pestPlayer.vacuums.find((item) => item.item.uuid === uuid);
		if (vacuum) return vacuum.getUpgrades({ stats: VACUUM_STATS, sourceTypes: ['vacuum'] });

		return progress.upgrades ?? [];
	}

	expandPhaseUpgrade(phase: PestFarmingPhase, upgrade: FortuneUpgrade): UpgradeTreeNode {
		if (getFortuneUpgradeIdentity(upgrade) === this.secondHelianthusSetRecommendation?.upgrade.conflictKey) {
			return {
				upgrade,
				statsBefore: {},
				statsAfter: {},
				statsGained: {},
				totalCost: upgrade.cost,
				children: (upgrade.groupedUpgrades ?? []).map((member) => ({
					upgrade: member,
					statsBefore: {},
					statsAfter: {},
					statsGained: member.stats ?? {},
					totalCost: member.cost,
					children: [],
				})),
			};
		}
		return this.pestPlayer.expandPhaseUpgrade(phase, upgrade, {
			stats: this.getPhaseStats(phase),
			crop: this.selectedCropKey,
			maxDepth: PEST_UPGRADE_TREE_MAX_DEPTH,
		});
	}

	expandActivePhaseUpgrade(upgrade: FortuneUpgrade): UpgradeTreeNode {
		return this.expandPhaseUpgrade(this.activePhase, upgrade);
	}

	hasPhaseUpgradePath(phase: PestFarmingPhase, upgrade: FortuneUpgrade): boolean {
		if (getFortuneUpgradeIdentity(upgrade) === this.secondHelianthusSetRecommendation?.upgrade.conflictKey) {
			return (upgrade.groupedUpgrades?.length ?? 0) > 0;
		}
		return (
			this.pestPlayer.expandPhaseUpgrade(phase, upgrade, {
				stats: this.getPhaseStats(phase),
				crop: this.selectedCropKey,
				maxDepth: 1,
			}).children.length > 0
		);
	}

	hasActivePhaseUpgradePath(upgrade: FortuneUpgrade): boolean {
		return this.hasPhaseUpgradePath(this.activePhase, upgrade);
	}

	applyPhaseUpgrade(phase: PestFarmingPhase, upgrade: FortuneUpgrade): void {
		if (this.#applyPetPurchaseRecommendation(upgrade)) return;
		if (this.#applySecondHelianthusSetRecommendation(upgrade)) return;
		if (this.optimizationRunning) this.cancelLoadoutOptimization();
		this.pestPlayer.applyPhaseUpgrade(phase, upgrade);
		this.options = this.pestPlayer.getOptionsSnapshot();
		this.selectedVacuumId = this.pestPlayer.selectedVacuum?.item.uuid ?? this.selectedVacuumId;
		this.pestVersion++;
		trackAnalytics('pest_farming.upgrade_applied', { phase });
	}

	applyActivePhaseUpgrade(upgrade: FortuneUpgrade): void {
		this.applyPhaseUpgrade(this.activePhase, upgrade);
	}

	selectVacuum(id: string): void {
		this.selectedVacuumId = id;
		this.options = { ...this.options, selectedVacuumId: id } as PestFarmingPlayerOptions;
		const vacuum = this.pestPlayer.vacuums.find((item) => item.item.uuid === id);
		if (vacuum) this.pestPlayer.selectVacuum(vacuum);
		this.pestVersion++;
	}

	getStoredArmorSets(): PestArmorSetLoadout[] {
		return this.pestPlayer.armorSetLoadouts.map((set) => ({
			...set,
			pieces: { ...set.pieces },
		}));
	}

	getStoredEquipmentSets(): PestEquipmentSetLoadout[] {
		return this.pestPlayer.equipmentSetLoadouts.map((set) => ({ ...set, pieces: { ...set.pieces } }));
	}

	getArmorPieceConflict(
		armorSetId: string | undefined,
		uuid: string | null | undefined
	): PestGearPieceConflict | undefined {
		this.trackPestVersion();
		return findPestGearPieceConflict(this.pestPlayer.armorSetLoadouts, armorSetId, uuid);
	}

	getEquipmentPieceConflict(
		equipmentSetId: string | undefined,
		uuid: string | null | undefined
	): PestGearPieceConflict | undefined {
		this.trackPestVersion();
		return findPestGearPieceConflict(this.pestPlayer.equipmentSetLoadouts, equipmentSetId, uuid);
	}

	#commitLoadoutState(state: PestLoadoutProfileState, cancelOptimization = true): void {
		if (cancelOptimization && this.optimizationRunning) this.cancelLoadoutOptimization();
		this.loadoutState = clonePestLoadoutState(state);
		this.refreshPestPlayerWith({
			armorSets: this.loadoutState.armorSets,
			equipmentSets: this.loadoutState.equipmentSets,
			loadoutPresets: this.loadoutState.presets,
			phasePresetIds: this.loadoutState.phasePresetIds,
			phaseLoadouts: undefined,
		});
	}

	updateArmorSets(armorSets: PestArmorSetLoadout[]): void {
		if (!this.loadoutState) return;
		const previous = new Map(this.loadoutState.armorSets.map((set) => [set.id, set]));
		this.#commitLoadoutState({
			...this.loadoutState,
			armorSets: armorSets.map((set) => ({
				...set,
				pieces: { ...set.pieces },
				source: { ...(previous.get(set.id)?.source ?? { kind: 'local' as const }) },
			})),
		});
	}

	updateEquipmentSets(equipmentSets: PestEquipmentSetLoadout[]): void {
		if (!this.loadoutState) return;
		const previous = new Map(this.loadoutState.equipmentSets.map((set) => [set.id, set]));
		this.#commitLoadoutState({
			...this.loadoutState,
			equipmentSets: equipmentSets.map((set) => ({
				...set,
				pieces: { ...set.pieces },
				source: { ...(previous.get(set.id)?.source ?? { kind: 'local' as const }) },
			})),
		});
	}

	selectArmorSetPiece(armorSetId: string, slot: GearSlot, uuid: string): void {
		if (!PEST_ARMOR_SLOTS.includes(slot as (typeof PEST_ARMOR_SLOTS)[number])) return;

		const armorSets = this.getStoredArmorSets();
		const next = armorSets.map((set) =>
			set.id === armorSetId
				? {
						...set,
						pieces: {
							...set.pieces,
							[slot]: uuid,
						},
					}
				: set
		);
		this.updateArmorSets(next);
		trackAnalytics('pest_farming.armor_selected', { slot, phase: this.activePhase });
	}

	clearArmorSetPiece(armorSetId: string, slot: GearSlot): void {
		const armorSets = this.getStoredArmorSets();
		const next = armorSets.map((set) => {
			if (set.id !== armorSetId) return set;
			const pieces = { ...set.pieces };
			pieces[slot] = null;
			return { ...set, pieces };
		});
		this.updateArmorSets(next);
		trackAnalytics('pest_farming.armor_cleared', { slot, phase: this.activePhase });
	}

	selectEquipmentSetPiece(equipmentSetId: string, slot: GearSlot, uuid: string): void {
		if (!PEST_EQUIPMENT_SLOTS.includes(slot as (typeof PEST_EQUIPMENT_SLOTS)[number])) return;
		const next = this.getStoredEquipmentSets().map((set) =>
			set.id === equipmentSetId ? { ...set, pieces: { ...set.pieces, [slot]: uuid } } : set
		);
		this.updateEquipmentSets(next);
		trackAnalytics('pest_farming.equipment_selected', { slot });
	}

	clearEquipmentSetPiece(equipmentSetId: string, slot: GearSlot): void {
		const next = this.getStoredEquipmentSets().map((set) =>
			set.id === equipmentSetId ? { ...set, pieces: { ...set.pieces, [slot]: null } } : set
		);
		this.updateEquipmentSets(next);
		trackAnalytics('pest_farming.equipment_cleared', { slot });
	}

	selectPhasePet(phase: PestFarmingPhase, petId?: string): void {
		const preset = this.pestPlayer.getPhasePreset(phase);
		if (!preset) return;
		this.updatePreset(preset.id, { petId }, this.getPresetPhases(preset.id).length > 1 ? phase : undefined);
		trackAnalytics('pest_farming.phase_pet_selected', { phase });
	}

	updatePreset(id: string, patch: Partial<PestLoadoutPreset>, forkForPhase?: PestFarmingPhase): string | undefined {
		if (!this.loadoutState) return;
		const existing = this.loadoutState.presets.find((preset) => preset.id === id);
		if (!existing) return;
		const nextId = forkForPhase ? this.#localEntityId('loadout') : id;
		const updated: StoredPestLoadoutPreset = {
			...existing,
			...patch,
			id: nextId,
			name: patch.name?.trim() || existing.name,
			source: forkForPhase ? { kind: 'local' } : { ...existing.source },
		};
		const presets = forkForPhase
			? [...this.loadoutState.presets, updated]
			: this.loadoutState.presets.map((preset) => (preset.id === id ? updated : preset));
		const phasePresetIds = forkForPhase
			? { ...this.loadoutState.phasePresetIds, [forkForPhase]: nextId }
			: this.loadoutState.phasePresetIds;
		this.#commitLoadoutState({ ...this.loadoutState, presets, phasePresetIds });
		return nextId;
	}

	createArmorSet(name = 'New Armor Set', pieces: Partial<Record<GearSlot, string | null>> = {}): string | undefined {
		if (!this.loadoutState) return;
		const id = this.#localEntityId('armor');
		const set: StoredPestArmorSet = { id, name, pieces: { ...pieces }, source: { kind: 'local' } };
		this.#commitLoadoutState({ ...this.loadoutState, armorSets: [...this.loadoutState.armorSets, set] });
		return id;
	}

	createEquipmentSet(
		name = 'New Equipment Set',
		pieces: Partial<Record<GearSlot, string | null>> = {}
	): string | undefined {
		if (!this.loadoutState) return;
		const id = this.#localEntityId('equipment');
		const set: StoredPestEquipmentSet = { id, name, pieces: { ...pieces }, source: { kind: 'local' } };
		this.#commitLoadoutState({ ...this.loadoutState, equipmentSets: [...this.loadoutState.equipmentSets, set] });
		return id;
	}

	getPresetPhases(id: string): PestFarmingPhase[] {
		if (!this.loadoutState) return [];
		return Object.entries(this.loadoutState.phasePresetIds)
			.filter(([, presetId]) => presetId === id)
			.map(([phase]) => phase as PestFarmingPhase);
	}

	getArmorSetPresetIds(id: string): string[] {
		return this.loadoutState?.presets.filter((preset) => preset.armorSetId === id).map((preset) => preset.id) ?? [];
	}

	getEquipmentSetPresetIds(id: string): string[] {
		return (
			this.loadoutState?.presets.filter((preset) => preset.equipmentSetId === id).map((preset) => preset.id) ?? []
		);
	}

	forkActiveArmorSet(): string | undefined {
		const current = this.pestPlayer.getArmorSetLoadout(this.activePhaseLoadout.armorSetId);
		const id = this.createArmorSet(`${this.activePhaseConfig.label} Armor`, current?.pieces);
		if (!id || !this.activeLoadoutPreset) return id;
		this.updatePreset(
			this.activeLoadoutPreset.id,
			{ armorSetId: id },
			this.getPresetPhases(this.activeLoadoutPreset.id).length > 1 ? this.activePhase : undefined
		);
		return id;
	}

	forkActiveEquipmentSet(): string | undefined {
		const current = this.pestPlayer.getEquipmentSetLoadout(this.activePhaseLoadout.equipmentSetId);
		const id = this.createEquipmentSet(`${this.activePhaseConfig.label} Equipment`, current?.pieces);
		if (!id || !this.activeLoadoutPreset) return id;
		this.updatePreset(
			this.activeLoadoutPreset.id,
			{ equipmentSetId: id },
			this.getPresetPhases(this.activeLoadoutPreset.id).length > 1 ? this.activePhase : undefined
		);
		return id;
	}

	prepareActiveArmorSetForEdit(): string | undefined {
		const setId = this.activePhaseLoadout.armorSetId;
		if (!setId || !this.activeLoadoutPreset) return this.forkActiveArmorSet();
		const presetShared = this.getPresetPhases(this.activeLoadoutPreset.id).length > 1;
		const setShared = this.getArmorSetPresetIds(setId).some((id) => id !== this.activeLoadoutPreset?.id);
		return presetShared || setShared ? this.forkActiveArmorSet() : setId;
	}

	prepareActiveEquipmentSetForEdit(): string | undefined {
		const setId = this.activePhaseLoadout.equipmentSetId;
		if (!setId || !this.activeLoadoutPreset) return this.forkActiveEquipmentSet();
		const presetShared = this.getPresetPhases(this.activeLoadoutPreset.id).length > 1;
		const setShared = this.getEquipmentSetPresetIds(setId).some((id) => id !== this.activeLoadoutPreset?.id);
		return presetShared || setShared ? this.forkActiveEquipmentSet() : setId;
	}

	#localEntityId(kind: string): string {
		const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		return `local:${kind}:${suffix}`;
	}

	async optimizeLoadouts(): Promise<boolean> {
		if (!this.loadoutState || this.optimizationRunning || !this.itemPricesReady) return false;
		const revision = ++this.#optimizationRevision;
		this.optimizationRunning = true;
		this.optimizationEvaluated = 0;
		this.optimizationPass = 0;
		const profileKey = this.#getProfileKey();
		const stateKey = this.pestRateStateKey;
		const existingSources = new Map(this.loadoutState.presets.map((preset) => [preset.id, preset.source]));
		try {
			const result = await optimizePestLoadouts({
				player: this.pestPlayer,
				options: {
					crop: this.selectedCropKey,
					cycle: this.calculationPestRateSettings,
					attraction: this.pestAttraction,
				},
				priceBook: this.pestRatePriceBook,
				shouldCancel: () =>
					revision !== this.#optimizationRevision ||
					profileKey !== this.#getProfileKey() ||
					stateKey !== this.pestRateStateKey,
				yieldControl: nextBrowserFrame,
				onProgress: (progress) => {
					if (revision !== this.#optimizationRevision) return;
					this.optimizationEvaluated = progress.evaluated;
					this.optimizationPass = progress.pass;
				},
			});
			if (
				result.cancelled ||
				revision !== this.#optimizationRevision ||
				profileKey !== this.#getProfileKey() ||
				stateKey !== this.pestRateStateKey ||
				!this.loadoutState
			)
				return false;
			const presets: StoredPestLoadoutPreset[] = result.presets.map((preset) => ({
				...preset,
				source: { ...(existingSources.get(preset.id) ?? { kind: 'optimizer' as const }) },
			}));
			this.#commitLoadoutState(
				{
					...this.loadoutState,
					presets,
					phasePresetIds: result.phasePresetIds,
				},
				false
			);
			trackAnalytics('pest_farming.loadouts_optimized', { evaluated: result.evaluated });
			return true;
		} finally {
			if (revision === this.#optimizationRevision) this.optimizationRunning = false;
		}
	}

	cancelLoadoutOptimization(): void {
		this.#optimizationRevision++;
		this.optimizationRunning = false;
	}

	getPestRateImpact(upgrade: FortuneUpgrade): PestFarmingUpgradeRateImpact | undefined {
		const petPurchase = this.#getPetPurchaseRecommendation(upgrade);
		if (petPurchase) return petPurchase.impact;
		if (getFortuneUpgradeIdentity(upgrade) === this.secondHelianthusSetRecommendation?.upgrade.conflictKey) {
			return this.secondHelianthusSetRecommendation.impact;
		}
		return this.rateImpacts.upgradeImpacts.get(getFortuneUpgradeIdentity(upgrade));
	}

	#getCompletionComparison(upgrade: FortuneUpgrade) {
		const impact = this.completionRateImpacts.get(getCompletionUpgradeKey(upgrade));
		if (!impact) return undefined;
		const valued = this.pestRateCalculator.revalueUpgradeImpact(impact, this.pestRatePriceBook);
		return {
			complete: valued.valuationDelta.complete,
			coinsPerHour: valued.valuationDelta.coinsPerHour,
		};
	}

	getPestRateImpactValue(upgrade: FortuneUpgrade): number {
		const impact = this.getPestRateImpact(upgrade);
		const value = impact?.valuationDelta.coinsPerHour ?? 0;
		return Number.isFinite(value) ? value : 0;
	}

	#scheduleRateImpacts(): void {
		if (!this.ctx.ready) return;
		const calculator = this.pestRateCalculator;
		const before = this.pestRateMechanicsResult;
		const phase = this.activePhase;
		const secondSetKey = this.secondHelianthusSetRecommendation?.upgrade.conflictKey;
		const petPurchaseKeys = new Set(
			this.petPurchaseRecommendations.map((recommendation) => recommendation.upgrade.conflictKey)
		);
		const upgrades = this.neededItemUpgrades.filter((upgrade) => {
			const key = getFortuneUpgradeIdentity(upgrade);
			return key !== secondSetKey && !petPurchaseKeys.has(key);
		});
		const comparisons = createPestPhaseLoadoutComparisonTasks({
			player: this.pestPlayer,
			phase,
			options: {
				crop: this.selectedCropKey,
				cycle: this.calculationPestRateSettings,
				attraction: this.pestAttraction,
			},
			priceBook: MECHANICS_PRICE_BOOK,
			before,
		});
		untrack(() => {
			this.rateImpacts.restart({ calculator, before, phase, upgrades, comparisons });
		});
	}

	#scheduleSecondHelianthusSetRecommendation(): void {
		const stateKey = this.#getRecommendationValuationKey();
		void this.itemPricesReady;
		void this.optimizationRunning;
		this.trackPestVersion();
		if (!this.loadoutState || !this.itemPricesReady || this.optimizationRunning) return;
		if (stateKey === this.#secondHelianthusSetKey) return;

		this.#secondHelianthusSetKey = stateKey;
		const generation = ++this.#secondHelianthusSetGeneration;
		this.secondHelianthusSetRecommendation = undefined;
		this.secondHelianthusSetRevision++;
		this.secondHelianthusSetRecommendationRunning = true;
		const player = this.pestPlayer.clone();
		const options = {
			crop: this.selectedCropKey,
			cycle: this.calculationPestRateSettings,
			attraction: this.pestAttraction,
		};
		const priceBook = this.pestRatePriceBook;
		const before = this.pestRateResult;
		const yieldControl = createFrameBudgetYield();

		untrack(() => {
			void findSecondHelianthusSetRecommendation({
				player,
				options,
				priceBook,
				before,
				shouldCancel: () =>
					generation !== this.#secondHelianthusSetGeneration ||
					stateKey !== this.#getRecommendationValuationKey(),
				yieldControl,
			})
				.then((recommendation) => {
					if (
						generation !== this.#secondHelianthusSetGeneration ||
						stateKey !== this.#getRecommendationValuationKey()
					)
						return;
					this.secondHelianthusSetRecommendation = recommendation;
					this.secondHelianthusSetRevision++;
				})
				.catch(() => {
					if (
						generation !== this.#secondHelianthusSetGeneration ||
						stateKey !== this.#getRecommendationValuationKey()
					)
						return;
					this.secondHelianthusSetRecommendation = undefined;
					this.secondHelianthusSetRevision++;
				})
				.finally(() => {
					if (generation === this.#secondHelianthusSetGeneration)
						this.secondHelianthusSetRecommendationRunning = false;
				});
		});
	}

	#schedulePetPurchaseRecommendations(): void {
		const stateKey = this.#getPetPurchaseRecommendationKey();
		void this.itemPricesReady;
		void this.optimizationRunning;
		this.trackPestVersion();
		if (!this.loadoutState || !this.itemPricesReady || this.optimizationRunning) return;
		if (stateKey === this.#petPurchaseKey) return;

		this.#petPurchaseKey = stateKey;
		const generation = ++this.#petPurchaseGeneration;
		this.petPurchaseRecommendations = [];
		this.petPurchaseRevision++;
		this.petPurchaseRecommendationsRunning = true;
		const player = this.pestPlayer.clone();
		const options = {
			crop: this.selectedCropKey,
			cycle: this.calculationPestRateSettings,
			attraction: this.pestAttraction,
		};
		const priceBook = this.pestRatePriceBook;
		const before = this.pestRateResult;
		const items = { ...this.itemsData };
		const yieldControl = createFrameBudgetYield();

		untrack(() => {
			void findPestPetPurchaseRecommendations({
				player,
				options,
				priceBook,
				before,
				items,
				shouldCancel: () =>
					generation !== this.#petPurchaseGeneration || stateKey !== this.#getPetPurchaseRecommendationKey(),
				yieldControl,
			})
				.then((recommendations) => {
					if (
						generation !== this.#petPurchaseGeneration ||
						stateKey !== this.#getPetPurchaseRecommendationKey()
					)
						return;
					this.petPurchaseRecommendations = recommendations;
					this.petPurchaseRevision++;
				})
				.catch(() => {
					if (
						generation !== this.#petPurchaseGeneration ||
						stateKey !== this.#getPetPurchaseRecommendationKey()
					)
						return;
					this.petPurchaseRecommendations = [];
					this.petPurchaseRevision++;
				})
				.finally(() => {
					if (generation === this.#petPurchaseGeneration) this.petPurchaseRecommendationsRunning = false;
				});
		});
	}

	#getRecommendationValuationKey(): string {
		const itemIds = [...this.rateOutputItems].sort();
		return JSON.stringify([
			this.pestRateMechanicsKey,
			itemIds.map((itemId) => [itemId, this.pestRatePriceBook.items?.[itemId] ?? null]),
		]);
	}

	#getPetPurchaseRecommendationKey(): string {
		const purchaseItemIds = ['PET', ...Object.keys(FARMING_PET_ITEMS)].sort();
		return JSON.stringify([
			this.#getRecommendationValuationKey(),
			purchaseItemIds.map((itemId) => [itemId, this.itemsData[itemId] ?? null]),
		]);
	}

	#getPetPurchaseRecommendation(upgrade: FortuneUpgrade): PestPetPurchaseRecommendation | undefined {
		const key = getFortuneUpgradeIdentity(upgrade);
		return this.petPurchaseRecommendations.find((recommendation) => recommendation.upgrade.conflictKey === key);
	}

	#applyPetPurchaseRecommendation(upgrade: FortuneUpgrade): boolean {
		const recommendation = this.#getPetPurchaseRecommendation(upgrade);
		if (!recommendation) return false;

		this.pestPlayer = recommendation.player;
		this.options = recommendation.player.getOptionsSnapshot();
		this.petPurchaseRecommendations = [];
		this.#petPurchaseKey = '';
		this.#petPurchaseGeneration++;
		this.petPurchaseRevision++;
		if (this.loadoutState) {
			const presetSources = new Map(this.loadoutState.presets.map((preset) => [preset.id, preset.source]));
			this.#commitLoadoutState({
				...this.loadoutState,
				presets: recommendation.player.loadoutPresets.map((preset) => ({
					...preset,
					source: { ...(presetSources.get(preset.id) ?? { kind: 'local' as const }) },
				})),
				phasePresetIds: { ...recommendation.player.phasePresetIds },
			});
		} else {
			this.pestPlayer = recommendation.player;
			this.pestVersion++;
		}
		trackAnalytics('pest_farming.pet_purchase_applied', {
			phases: recommendation.phases.join(','),
		});
		return true;
	}

	#applySecondHelianthusSetRecommendation(upgrade: FortuneUpgrade): boolean {
		const recommendation = this.secondHelianthusSetRecommendation;
		if (!recommendation || getFortuneUpgradeIdentity(upgrade) !== recommendation.upgrade.conflictKey) return false;
		if (!this.loadoutState) return true;

		const armorSources = new Map(this.loadoutState.armorSets.map((set) => [set.id, set.source]));
		const equipmentSources = new Map(this.loadoutState.equipmentSets.map((set) => [set.id, set.source]));
		const presetSources = new Map(this.loadoutState.presets.map((preset) => [preset.id, preset.source]));
		this.pestPlayer = recommendation.player;
		this.options = recommendation.player.getOptionsSnapshot();
		this.secondHelianthusSetRecommendation = undefined;
		this.#secondHelianthusSetKey = '';
		this.#secondHelianthusSetGeneration++;
		this.#commitLoadoutState({
			...this.loadoutState,
			armorSets: recommendation.player.armorSetLoadouts.map((set) => ({
				...set,
				pieces: { ...set.pieces },
				source: { ...(armorSources.get(set.id) ?? { kind: 'local' as const }) },
			})),
			equipmentSets: recommendation.player.equipmentSetLoadouts.map((set) => ({
				...set,
				pieces: { ...set.pieces },
				source: { ...(equipmentSources.get(set.id) ?? { kind: 'local' as const }) },
			})),
			presets: recommendation.player.loadoutPresets.map((preset) => ({
				...preset,
				source: { ...(presetSources.get(preset.id) ?? { kind: 'local' as const }) },
			})),
			phasePresetIds: { ...recommendation.player.phasePresetIds },
		});
		trackAnalytics('pest_farming.second_helianthus_set_applied', {
			phases: recommendation.phases.join(','),
		});
		return true;
	}

	#revalueRateImpacts(): void {
		void this.rateImpacts.mechanicsRevision;
		void this.itemsVersion;
		const calculator = this.pestRateCalculator;
		const priceBook = this.pestRatePriceBook;
		untrack(() => this.rateImpacts.revalue(calculator, priceBook));
	}

	#createRateCalculator(
		player = this.pestPlayer,
		priceBook: PestRatePriceBook = this.pestRatePriceBook
	): PestFarmingRateCalculator {
		return new PestFarmingRateCalculator({
			player,
			options: {
				crop: this.selectedCropKey,
				cycle: this.calculationPestRateSettings,
				attraction: this.pestAttraction,
			},
			priceBook,
		});
	}

	#scheduleCalculationPestRateSettings(settings: PestCycleSettings): void {
		const next = { ...settings };
		const key = JSON.stringify(next);
		if (key === this.#calculationPestRateSettingsKey) {
			if (this.#rateSettingsTimer !== undefined) clearTimeout(this.#rateSettingsTimer);
			this.#rateSettingsTimer = undefined;
			this.#pendingPestRateSettingsKey = '';
			this.#pendingRateSettingAnalyticsKeys.clear();
			return;
		}
		if (key === this.#pendingPestRateSettingsKey) return;

		this.#pendingPestRateSettingsKey = key;
		if (this.#rateSettingsTimer !== undefined) clearTimeout(this.#rateSettingsTimer);
		this.#rateSettingsTimer = setTimeout(() => {
			this.#rateSettingsTimer = undefined;
			if (key !== this.#pendingPestRateSettingsKey) return;
			this.#commitCalculationPestRateSettings(next, key);
		}, RATE_SETTINGS_DEBOUNCE_MS);
	}

	#commitCalculationPestRateSettings(settings: PestCycleSettings, key = JSON.stringify(settings)): void {
		this.calculationPestRateSettings = { ...settings };
		this.#calculationPestRateSettingsKey = key;
		this.#pendingPestRateSettingsKey = '';
		for (const changedKey of this.#pendingRateSettingAnalyticsKeys) {
			trackAnalytics('pest_farming.rate_setting_changed', { key: changedKey });
		}
		this.#pendingRateSettingAnalyticsKeys.clear();
	}

	setPestRateSetting<K extends keyof PestFarmingRateSettings>(key: K, value: PestFarmingRateSettings[K]): void {
		this.#pendingRateSettingAnalyticsKeys.add(key);
		this.#updatePestFarmingData({
			rateSettings: {
				...this.rates.pestFarming.rateSettings,
				[key]: value,
			},
		});
	}

	setPestTimeOfDay(timeOfDay: PestFarmingTimeOfDay): void {
		if (this.lockedPestTimeOfDay) return;
		this.#updatePestFarmingData({ timeOfDay });
		trackAnalytics('pest_farming.time_of_day_changed', { timeOfDay });
	}

	setPestAttraction<K extends keyof PestAttractionSettings>(key: K, value: PestAttractionSettings[K]): void {
		this.#updatePestFarmingData({
			attraction: {
				...this.rates.pestFarming.attraction,
				[key]: value,
			},
		});
		trackAnalytics('pest_farming.attraction_changed', { key });
	}

	setSprayedPlot(checked: boolean): void {
		this.#updatePestFarmingData({ sprayedPlot: checked });
		this.refreshPestPlayerWith({ sprayedPlot: checked });
	}

	setSprayonatorTier(tier: SprayonatorTier): void {
		this.#updatePestFarmingData({ sprayonatorTier: tier });
		this.refreshPestPlayerWith({ sprayonatorTier: tier });
	}

	setFeastBurgers(feastBurgers: number): void {
		this.#updateRatesData((rates) => ({
			...rates,
			feastBurgers,
		}));
		this.refreshPestPlayerWith({
			feastBurgers: Number(this.ctx.member.current?.unparsed?.consumed?.feast_burger ?? feastBurgers),
		});
	}

	setUseTemporaryFortune(checked: boolean): void {
		this.#updateRatesData((rates) => ({
			...rates,
			useTemp: checked,
		}));
		this.refreshPestPlayerWith({ temporaryFortune: checked ? this.rates.temp : undefined });
	}

	setTemporaryFortune<K extends keyof TemporaryFarmingFortune>(
		key: K,
		value: Required<TemporaryFarmingFortune>[K]
	): void {
		const temp = { ...this.rates.temp, [key]: value };
		const useTemp = value ? true : this.rates.useTemp;
		this.#updateRatesData((rates) => ({
			...rates,
			useTemp,
			temp,
		}));
		this.refreshPestPlayerWith({ temporaryFortune: useTemp ? temp : undefined });
	}

	setStinkyCheesePotion(checked: boolean): void {
		this.setTemporaryFortune('stinkyCheesePotion', checked);
	}

	setOverdriveActive(checked: boolean): void {
		this.#updateRatesData((rates) => ({
			...rates,
			overdriveActive: checked,
		}));
		this.refreshPestPlayerWith({
			jacobContest: {
				enabled: checked,
				crop: this.selectedCropKey,
			},
		});
	}

	#buildOptions(previous: Partial<PestFarmingPlayerOptions> = {}): PestFarmingPlayerOptions {
		const rates = this.rates;
		const selectedVacuumId = untrack(() => this.selectedVacuumId);
		const loadoutState = untrack(() => this.loadoutState);

		return {
			...previous,
			tools: this.tools,
			vacuums: this.vacuums,
			armor: this.armor,
			equipment: this.equipment,
			accessories: this.ctx.accessories as EliteItemDto[],
			pets: this.pets,
			selectedVacuumId,
			armorSets: loadoutState?.armorSets,
			equipmentSets: loadoutState?.equipmentSets,
			loadoutPresets: loadoutState?.presets,
			phasePresetIds: loadoutState?.phasePresetIds,
			phaseLoadouts: undefined,
			selectedCrop: this.selectedCropKey,

			refinedTruffles: this.ctx.member.current?.chocolateFactory?.refinedTrufflesConsumed ?? 0,
			personalBestsUnlocked: this.ctx.member.current?.jacob?.perks?.personalBests ?? false,
			personalBests: (this.ctx.member.current?.jacob?.stats?.personalBests ?? {}) as unknown as Record<
				string,
				number
			>,
			anitaBonus: this.ctx.member.current?.jacob?.perks?.doubleDrops ?? 0,
			plots: this.ctx.member.current?.garden?.plots,
			farmingXp: this.ctx.member.current?.skills?.farming,
			bestiaryKills:
				(this.ctx.member.current?.unparsed?.bestiary as { kills: Record<string, number> })?.kills ?? {},
			uniqueVisitors: this.ctx.member.current?.garden?.uniqueVisitors ?? 0,
			exportableCrops: this.ctx.member.current?.unparsed?.exportedCrops ?? {},
			dnaMilestone: this.ctx.member.current?.unparsed?.dnaMilestone ?? 0,
			attributes: this.ctx.member.current?.memberData?.attributes ?? {},
			chips: this.ctx.member.current?.memberData?.garden?.chips ?? {},
			chipRarities: this.rates.chipRarities,
			perks: this.ctx.member.current?.unparsed?.perks ?? undefined,
			harvestFeast: this.harvestFeastOptions,

			farmingLevel: getLevelProgress(
				'farming',
				this.ctx.member.current?.skills?.farming ?? 0,
				(this.ctx.member.current?.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
			).level,
			milestones: getCropMilestoneLevels(
				(this.ctx.member.current?.garden?.crops ?? {}) as unknown as Record<string, number>
			),
			cropUpgrades: getCropUpgrades(
				(this.ctx.member.current?.garden?.cropUpgrades ?? {}) as unknown as Record<string, number>
			),
			gardenLevel: getGardenLevel(Number(this.ctx.member.current?.garden?.experience ?? 0)).level,

			communityCenter: rates.communityCenter,
			filledRosewaterFlask: rates.rosewaterFlasks,
			strength: rates.strength,
			speed: rates.speed,
			wrigglingLarva: Number(this.ctx.member.current?.unparsed?.consumed?.wriggling_larva ?? 0),
			feastBurgers: Number(this.ctx.member.current?.unparsed?.consumed?.feast_burger ?? rates.feastBurgers),
			sprayedPlot: rates.pestFarming.sprayedPlot,
			sprayonatorTier: rates.pestFarming.sprayonatorTier,
			pesthunterAccessoryEnabled: true,
			infestedPlotProbability: rates.infestedPlotProbability,
			cocoaFortuneUpgrade: this.ctx.member.current?.chocolateFactory?.cocoaFortuneUpgrades,
			temporaryFortune: rates.useTemp ? rates.temp : undefined,
			jacobContest: {
				enabled: rates.overdriveActive,
				crop: this.selectedCropKey,
			},
			zorro: rates.zorroMode
				? {
						enabled: this.ctx.member.current?.chocolateFactory?.unlockedZorro ?? false,
						mode: rates.zorroMode,
					}
				: undefined,
		} as PestFarmingPlayerOptions;
	}

	#loadItemPrices(): void {
		if (!this.rateImpacts.ready) return;
		const items = this.neededItems;
		const requestKey = JSON.stringify([...items].sort());
		if (requestKey === this.#lastItemRequestKey) return;
		this.#lastItemRequestKey = requestKey;
		const revision = ++this.#itemPriceLoadRevision;
		this.itemPricesReady = false;
		this.itemPriceLoadFailed = false;
		const uncachedItems = items.filter((item) => !this.itemsData[item]);
		const { cached, missing: missingItems } = readCachedPestPrices(uncachedItems);
		if (Object.keys(cached).length > 0) {
			this.itemsData = { ...this.itemsData, ...cached };
			this.itemsVersion++;
		}
		if (missingItems.length === 0) {
			this.itemPricesReady = true;
			return;
		}

		void getItems(missingItems)
			.then((data) => {
				if (revision !== this.#itemPriceLoadRevision) return;
				cachePestPrices(data);
				this.itemsData = { ...this.itemsData, ...data };
				this.itemsVersion++;
				this.itemPricesReady = true;
			})
			.catch(() => {
				if (revision !== this.#itemPriceLoadRevision) return;
				this.itemPriceLoadFailed = true;
				this.#lastItemRequestKey = '';
			});
	}

	retryItemPrices(): void {
		if (!this.itemPriceLoadFailed) return;
		this.#lastItemRequestKey = '';
		this.#loadItemPrices();
	}

	#syncExternalState(): void {
		if (!this.ctx.ready) return;
		const profileKey = this.#getProfileKey();
		if (profileKey !== this.#profileKey) {
			this.#profileKey = profileKey;
			this.#loadoutImportKey = '';
			this.#resetSessionSelections();
		}
		const importKey = this.#getLoadoutImportKey();
		let importedLoadouts = false;
		if (importKey !== this.#loadoutImportKey) {
			if (!this.#loadProfileLoadouts()) return;
			this.#loadoutImportKey = importKey;
			importedLoadouts = true;
		}
		const previous = untrack(() => this.options);
		const nextOptions = this.#buildOptions(previous);
		if (this.#skipNextRatesDataRefresh) {
			this.#skipNextRatesDataRefresh = false;
			if (!importedLoadouts) return;
		}
		this.options = nextOptions;
		untrack(() => this.refreshPestPlayer());
	}

	#syncSelectedCrop(): void {
		if (!this.ctx.ready) return;
		if (this.rates.pestFarming.selectedCrop !== this.selectedCropName) {
			this.#updatePestFarmingData({ selectedCrop: this.selectedCropName });
		}
	}

	#syncVacuumSelection(): void {
		if (!this.ctx.ready || !this.vacuums.length) return;
		const nextId = this.vacuums.some((vacuum) => vacuum.item.uuid === this.selectedVacuumId)
			? this.selectedVacuumId
			: (this.vacuums[0]?.item.uuid ?? '');
		if (nextId && this.selectedVacuumId !== nextId) this.selectVacuum(nextId);
	}

	#restoreSavedCrop(): void {
		const savedCrop = this.rates.pestFarming.selectedCrop;
		if (savedCrop) {
			this.#selectedCrops.set({ ...DEFAULT_SELECTED_CROPS, [savedCrop]: true });
		}
	}

	#updatePestFarmingData(patch: Partial<PestFarmingData>): void {
		this.#updateRatesData((rates) => ({
			...rates,
			pestFarming: {
				...rates.pestFarming,
				...patch,
			},
		}));
	}

	#updateRatesData(updater: (rates: RatesData) => RatesData): void {
		this.#skipNextRatesDataRefresh = true;
		this.#ratesData.update(updater);
	}
}
