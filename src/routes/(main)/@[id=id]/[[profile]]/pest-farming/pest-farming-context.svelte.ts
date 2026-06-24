import { trackAnalytics } from '$lib/analytics';
import type { RatesItemPriceData } from '$lib/api/elite';
import { PROPER_CROP_TO_API_CROP } from '$lib/constants/crops';
import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
import { getLevelProgress } from '$lib/format';
import { getItemsFromUpgrades } from '$lib/items';
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
	Crop,
	CROP_INFO,
	DEFAULT_PEST_CYCLE_SETTINGS,
	FarmingArmor,
	FarmingEquipment,
	FarmingPet,
	FarmingTool,
	GearSlot,
	getCropFromName,
	getCropMilestoneLevels,
	getCropUpgrades,
	getGardenLevel,
	Pest,
	PEST_ARMOR_SLOTS,
	PEST_EQUIPMENT_SLOTS,
	PEST_FARMING_PHASE_STATS,
	PEST_FARMING_STATS,
	PEST_MAIN_ARMOR_SET_ID,
	PEST_SPAWN_ARMOR_SET_ID,
	PestFarmingPhase,
	PestFarmingRateCalculator,
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
	type PestFarmingPlayerOptions,
	type PestFarmingUpgradeRateImpact,
	type PestPhaseLoadout,
	type PestRateItemPrice,
	type PestRatePriceBook,
	type StatBreakdown,
	type TemporaryFarmingFortune,
	type UpgradeTreeNode,
} from 'farming-weight';
import { Debounced } from 'runed';
import { onMount, untrack } from 'svelte';
import { fromStore } from 'svelte/store';

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

const SHARED_EQUIPMENT_STATS = [
	Stat.BonusPestChance,
	Stat.PestCooldownReduction,
	Stat.PestKillFortune,
	Stat.FarmingFortune,
	Stat.Overbloom,
];

const PEST_UPGRADE_TREE_MAX_DEPTH = 4;

const cropKey = (crop: string) =>
	(PROPER_CROP_TO_API_CROP[crop as keyof typeof PROPER_CROP_TO_API_CROP] ??
		getCropFromName(crop) ??
		Crop.Wheat) as Crop;

const sumStatBreakdown = (breakdown: StatBreakdown): number =>
	Object.values(breakdown).reduce((sum, entry) => sum + entry.value, 0);

type PestFarmingPlayer = ReturnType<typeof createPestFarmingPlayer>;
type RatesItemPriceEntry = RatesItemPriceData[string];
const BASE_CROP_ITEM_IDS = new Set<string>(Object.values(Crop));
const STATIC_NPC_ITEM_PRICES: Record<string, PestRateItemPrice> = {
	'SLUG;3': { coins: 500_000, source: 'npc' },
	'SLUG;4': { coins: 5_000_000, source: 'npc' },
};

function getLockedPestTimeOfDay(crop: Crop): PestFarmingTimeOfDay | undefined {
	if (crop === Crop.Sunflower) return 'day';
	if (crop === Crop.Moonflower) return 'night';
	return undefined;
}

function getExcludedPestForTime(timeOfDay: PestFarmingTimeOfDay): Pest {
	return timeOfDay === 'day' ? Pest.Firefly : Pest.Dragonfly;
}

function getUpgradeIdentity(upgrade: FortuneUpgrade): string {
	return (
		upgrade.conflictKey ??
		`${upgrade.title}:${upgrade.action}:${upgrade.meta?.type ?? ''}:${upgrade.meta?.id ?? upgrade.meta?.key ?? ''}`
	);
}

function getItemSellValue(itemId: string, item: RatesItemPriceEntry | undefined): PestRateItemPrice | undefined {
	if (!item) return undefined;

	const npc = item.bazaar?.npc || item.item?.npc_sell_price || 0;
	if (BASE_CROP_ITEM_IDS.has(itemId)) {
		return npc > 0 ? { coins: npc, source: 'npc' } : undefined;
	}

	const bazaar = item.bazaar?.averageSellOrder || item.bazaar?.averageSell || 0;
<<<<<<< HEAD
	const auctionPrices = item.auctions
		?.map((auction) => (auction.lowest > 0 ? auction.lowest : auction.last))
		.filter((price) => price > 0);
	const auction = auctionPrices?.length ? Math.min(...auctionPrices) : 0;
	const marketValues = [
		{ coins: bazaar, source: 'bazaar' },
		{ coins: auction, source: 'auction' },
	].filter((price): price is PestRateItemPrice => price.coins > 0);
	const market = marketValues.length ? marketValues.sort((a, b) => a.coins - b.coins)[0] : undefined;
=======
	const auction = item.auctions?.reduce<number>((min, a) => {
		const price = a.lowest > 0 ? a.lowest : a.last;
		return price > 0 && price < min ? price : min;
	}, Infinity) ?? Infinity;
	const auctionPrice = isFinite(auction) ? auction : 0;

	const market: PestRateItemPrice | undefined =
		bazaar > 0 && (auctionPrice <= 0 || bazaar <= auctionPrice)
			? { coins: bazaar, source: 'bazaar' }
			: auctionPrice > 0
				? { coins: auctionPrice, source: 'auction' }
				: undefined;
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556

	if (npc > 0 && npc >= (market?.coins ?? 0)) {
		return { coins: npc, source: 'npc' };
	}
	return market;
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
	armorSets = $state<PestArmorSetLoadout[]>([]);
	phaseLoadouts = $state<Partial<Record<PestFarmingPhase, PestPhaseLoadout>>>({});
	sharedEquipment = $state<Partial<Record<GearSlot, string>>>({});
	activePhase = $state<PestFarmingPhase>(PestFarmingPhase.Farm);
	itemsData = $state<RatesItemPriceData>({});
	itemsVersion = $state(0);

	#skipNextRatesDataRefresh = false;
	#profileKey = '';
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#rateImpactMemo = new Map<string, PestFarmingUpgradeRateImpact>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#gearRateImpactMemo = new Map<string, number>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#petRateImpactMemo = new Map<string, number>();
	#lastItemRequestKey = '';
<<<<<<< HEAD

	pets = $derived.by(() => (this.ctx.ready ? FarmingPet.fromArray(this.ctx.pets) : []));
=======
	#lastRateStateKey = '';
	#lastGearRateStateKey = '';
	#lastPetRateStateKey = '';

	pets = $derived.by(() => (this.ctx.ready ? FarmingPet.fromArray(this.ctx.pets) : []));
	sortedPets = $derived.by(() =>
		this.pets
			.filter((pet) => !!pet.pet.uuid)
			.sort((a, b) => this.getPetRateImpact(b, this.activePhase) - this.getPetRateImpact(a, this.activePhase))
	);
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
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
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const excludedPests = new Set(settings.excludedPests ?? []);
		excludedPests.add(getExcludedPestForTime(this.pestTimeOfDay));
		const isHooverius = this.selectedVacuum?.item.skyblockId === 'INFINI_VACUUM_HOOVERIUS';

		return {
			...settings,
			sprayonatorTarget: this.rates.pestFarming.sprayedPlot ? settings.sprayonatorTarget : undefined,
			hooveriusVinylTarget: isHooverius ? settings.hooveriusVinylTarget : undefined,
			hooveriusVinylMultiplier: isHooverius ? settings.hooveriusVinylMultiplier : undefined,
			excludedPests: [...excludedPests],
		};
	});
	pestRateSettings = $derived.by<PestCycleSettings>(() => ({
		...DEFAULT_PEST_CYCLE_SETTINGS,
		...this.rates.pestFarming.rateSettings,
		sprayedPlot: this.rates.pestFarming.sprayedPlot,
	}));
<<<<<<< HEAD
	pestRatePriceBook = $derived.by<PestRatePriceBook>(() => {
		void this.itemsVersion;
=======
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#itemPriceCache = new Map<string, PestRateItemPrice>();
	pestRatePriceBook = $derived.by<PestRatePriceBook>(() => {
		void this.itemsVersion;
		for (const [itemId, item] of Object.entries(this.itemsData)) {
			if (!this.#itemPriceCache.has(itemId)) {
				const price = getItemSellValue(itemId, item);
				if (price !== undefined) this.#itemPriceCache.set(itemId, price);
			}
		}
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
		return {
			version: String(this.itemsVersion),
			missingItemMode: 'exclude',
			items: {
				...STATIC_NPC_ITEM_PRICES,
<<<<<<< HEAD
				...Object.fromEntries(
					Object.entries(this.itemsData)
						.map(([itemId, item]) => [itemId, getItemSellValue(itemId, item)] as const)
						.filter((entry): entry is readonly [string, PestRateItemPrice] => entry[1] !== undefined)
				),
=======
				...Object.fromEntries(this.#itemPriceCache),
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
			},
		};
	});
	pestRateCalculator = $derived.by(() => {
		this.trackPestVersion();
		return this.#createRateCalculator();
	});
	pestRateResult = $derived.by(() => this.pestRateCalculator.calculate());
	pestRateStateKey = $derived(this.pestRateResult.stateKey);
	pestRateVersion = $derived(`${this.activePhase}:${this.pestRateStateKey}`);

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
		const inSeasonCrops = (current?.current ?? [])
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
	armorSetLoadouts = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.armorSetLoadouts;
	});
	sharedEquipmentSet = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.sharedEquipmentSet;
	});
	activePhaseLoadout = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.phaseLoadouts[this.activePhase];
	});
	activeArmorSet = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getArmorSetModel(this.activePhaseLoadout.armorSetId);
	});
	activePhasePlayer = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getPhasePlayer(this.activePhase);
	});
	activePhasePet = $derived(
		this.activePhasePlayer.pets.find((pet) => pet.pet.uuid === this.activePhaseLoadout.petId)
	);

	pestStats = $derived.by(() => {
		this.trackPestVersion();
		return this.getPhaseStats(this.activePhase).map((stat) => {
			const breakdown = this.pestPlayer.getPhaseStatBreakdown(this.activePhase, stat, this.selectedCropKey);
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
		return this.cropContextStats.map((stat) => {
			const breakdown = this.pestPlayer.crop.getStatBreakdown(stat, this.selectedCropKey);
			return {
				stat,
				total: sumStatBreakdown(breakdown),
				breakdown,
			};
		});
	});

	cropProgress = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getCropProgress(this.selectedCropKey, this.cropContextStats);
	});

	sharedEquipmentProgress = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getSharedEquipmentProgress(SHARED_EQUIPMENT_STATS);
	});

	activeArmorSetProgress = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getArmorSetProgress(
			this.activePhaseLoadout.armorSetId,
			this.getPhaseStats(this.activePhase)
		);
	});

	activePhaseGeneralProgress = $derived.by(() => {
		this.trackPestVersion();
		const stats = this.getPhaseStats(this.activePhase);
		const progress = this.pestPlayer.getPhaseProgress(this.activePhase, stats);
		const hasRelevantStat = (p: FortuneSourceProgress) =>
			!!p.stats &&
			Object.entries(p.stats).some(
				([stat, sp]) => stats.includes(stat as Stat) && (sp.current > 0 || sp.max > 0)
			);
		return progress.filter((p) => hasRelevantStat(p) || p.progress?.some(hasRelevantStat));
	});

	vacuumProgress = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getVacuumProgress(VACUUM_STATS);
	});

	activePhaseUpgrades = $derived.by(() => {
		this.trackPestVersion();
		return this.pestPlayer.getPhaseUpgrades(this.activePhase, {
			stats: this.getPhaseStats(this.activePhase),
			includeUpgradeGroups: true,
		});
	});

	armorSetConflictLabels = $derived.by(() => {
		this.trackPestVersion();
		const result: Record<string, string> = {};
		for (const set of this.pestPlayer.armorSetLoadouts) {
			if (set.id === this.activePhaseLoadout.armorSetId) continue;
			for (const uuid of Object.values(set.pieces)) {
				if (uuid) result[uuid] = set.name;
			}
		}
		return result;
	});

	visibleProgressUpgrades = $derived.by(() => {
		this.trackPestVersion();
		const progress = [
			...this.cropProgress,
			...this.sharedEquipmentProgress,
			...this.activeArmorSetProgress,
			...this.activePhaseGeneralProgress,
			...(this.activePhase === PestFarmingPhase.Kill ? this.vacuumProgress : []),
		];
		return progress.flatMap((entry) => this.getProgressUpgrades(entry));
	});

	neededItemUpgrades = $derived.by(() => {
		this.trackPestVersion();
		return [...this.visibleProgressUpgrades, ...this.activePhaseUpgrades];
	});

	rateOutputItems = $derived.by(() => this.pestRateCalculator.getRequiredPriceItems(this.pestRateResult));
	rateImpactItems = $derived.by(() => {
		void this.itemsVersion;
		this.trackPestVersion();
<<<<<<< HEAD
		const calculator = this.#createRateCalculator();
		const result = calculator.calculate();
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const items = new Set<string>();
		for (const upgrade of this.neededItemUpgrades) {
			const impact = this.#calculatePestRateImpact(calculator, result, this.activePhase, upgrade);
=======
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const items = new Set<string>();
		for (const upgrade of this.neededItemUpgrades) {
			const impact = this.#calculatePestRateImpact(
				this.pestRateCalculator,
				this.pestRateResult,
				this.activePhase,
				upgrade
			);
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
			for (const itemId of impact.valuationDelta.missingItemIds) {
				if (!this.itemsData[itemId]) items.add(itemId);
			}
		}
		return [...items];
	});

<<<<<<< HEAD
	neededItems = $derived([
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		...new Set([
			...getItemsFromUpgrades(this.neededItemUpgrades),
			...this.rateOutputItems,
			...this.rateImpactItems,
		]),
	]);
=======
	neededItems = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const seen = new Set<string>();
		for (const id of getItemsFromUpgrades(this.neededItemUpgrades)) seen.add(id);
		for (const id of this.rateOutputItems) seen.add(id);
		for (const id of this.rateImpactItems) seen.add(id);
		return [...seen];
	});
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
	debouncedItems = new Debounced(() => this.neededItems, 1000);

	constructor() {
		this.phaseLoadouts = this.#getPersistedPhaseLoadouts();
		this.options = this.#buildOptions({});
		this.refreshPestPlayer();

		$effect(() => this.#loadItemPrices());
		$effect(() => this.#syncExternalState());
		$effect(() => this.#syncSelectedCrop());
		$effect(() => this.#syncVacuumSelection());
		$effect(() => this.#syncDefaultSpawnArmorSelection());

		onMount(() => this.#restoreSavedCrop());
	}

	refreshPestPlayer() {
		let player = createPestFarmingPlayer(this.options);
		const phaseLoadouts = this.#getRateSelectedDefaultPhaseLoadouts(player);
		if (phaseLoadouts) {
			this.options = {
				...this.options,
				phaseLoadouts,
			} as PestFarmingPlayerOptions;
			player = createPestFarmingPlayer(this.options);
		}
		this.pestPlayer = player;
		this.#syncSessionSelectionsFromPestPlayer();
		this.pestVersion++;
	}

	refreshPestPlayerWith(patch: Partial<PestFarmingPlayerOptions>): void {
		this.options = { ...this.options, ...patch } as PestFarmingPlayerOptions;
		this.refreshPestPlayer();
	}

	#getProfileKey(): string {
		return `${this.ctx.uuid}:${this.ctx.selectedProfile?.profileId ?? ''}`;
	}

	#getPersistedPhaseLoadouts(): Partial<Record<PestFarmingPhase, PestPhaseLoadout>> {
		const loadouts = this.rates.pestFarming.phaseLoadouts;
		return Object.fromEntries(
			[PestFarmingPhase.Farm, PestFarmingPhase.Spawn, PestFarmingPhase.Kill]
				.map((phase) => {
					const armorSetId = loadouts[phase]?.armorSetId;
					return armorSetId ? [phase, { armorSetId }] : undefined;
				})
				.filter((entry): entry is [PestFarmingPhase, PestPhaseLoadout] => entry !== undefined)
		);
	}

	#getPersistablePhaseLoadouts(
		loadouts: Record<PestFarmingPhase, PestPhaseLoadout>
	): PestFarmingData['phaseLoadouts'] {
		return {
			[PestFarmingPhase.Farm]: { armorSetId: loadouts[PestFarmingPhase.Farm].armorSetId },
			[PestFarmingPhase.Spawn]: { armorSetId: loadouts[PestFarmingPhase.Spawn].armorSetId },
			[PestFarmingPhase.Kill]: { armorSetId: loadouts[PestFarmingPhase.Kill].armorSetId },
		};
	}

	#resetSessionSelections(): void {
		this.selectedVacuumId = '';
		this.armorSets = [];
		this.sharedEquipment = {};
		this.phaseLoadouts = this.#getPersistedPhaseLoadouts();
	}

	#syncSessionSelectionsFromPestPlayer(): void {
		this.armorSets = this.pestPlayer.armorSetLoadouts.map((set) => ({
			...set,
			pieces: { ...set.pieces },
		}));
		this.phaseLoadouts = Object.fromEntries(
			Object.entries(this.pestPlayer.phaseLoadouts).map(([phase, loadout]) => [phase, { ...loadout }])
		) as Record<PestFarmingPhase, PestPhaseLoadout>;
		this.sharedEquipment = { ...this.pestPlayer.sharedEquipment };
		this.selectedVacuumId = this.pestPlayer.selectedVacuum?.item.uuid ?? this.selectedVacuumId;
	}

	#syncDefaultSpawnArmorSelection(): void {
		void this.pestRatePriceBook.version;
		if (this.rates.pestFarming.phaseLoadouts[PestFarmingPhase.Spawn]?.armorSetId) return;

		const phaseLoadouts = this.#getRateSelectedDefaultPhaseLoadouts(this.pestPlayer);
		if (!phaseLoadouts) return;

		this.options = {
			...this.options,
			phaseLoadouts,
		} as PestFarmingPlayerOptions;
		untrack(() => this.refreshPestPlayer());
	}

	#getRateSelectedDefaultPhaseLoadouts(
		player: PestFarmingPlayer
	): Record<PestFarmingPhase, PestPhaseLoadout> | undefined {
		const candidates = this.#getDefaultSpawnArmorCandidateIds(player);
		if (!candidates) return;

		const bestId = this.#createRateCalculator(player).getBestSpawnPhaseArmorSetId(candidates);
		if (!bestId || player.phaseLoadouts[PestFarmingPhase.Spawn]?.armorSetId === bestId) return;

		return {
			...player.phaseLoadouts,
			[PestFarmingPhase.Spawn]: {
				...player.phaseLoadouts[PestFarmingPhase.Spawn],
				armorSetId: bestId,
			},
		};
	}

	#getDefaultSpawnArmorCandidateIds(player: PestFarmingPlayer): readonly string[] | undefined {
		if (this.rates.pestFarming.phaseLoadouts[PestFarmingPhase.Spawn]?.armorSetId) return undefined;

		const mainId =
			player.armorSetLoadouts.find((set) => set.id === PEST_MAIN_ARMOR_SET_ID)?.id ??
			player.armorSetLoadouts[0]?.id;
		const spawnId = player.armorSetLoadouts.find((set) => set.id === PEST_SPAWN_ARMOR_SET_ID)?.id;
		if (!mainId || !spawnId || mainId === spawnId) return undefined;

		return [mainId, spawnId];
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
		if (phase !== PestFarmingPhase.Kill) return stats;

		const cropStat = CROP_INFO[this.selectedCropKey]?.fortuneType;
		if (!cropStat || stats.includes(cropStat)) return stats;

		return [...stats, cropStat];
	}

	getPhasePieceBreakdown(piece: FarmingArmor | FarmingEquipment): StatBreakdown {
		return this.getPieceBreakdown(piece, this.getPhaseStats(this.activePhase));
	}

	getSharedEquipmentPieceBreakdown(piece: FarmingArmor | FarmingEquipment): StatBreakdown {
		return this.getPieceBreakdown(piece, SHARED_EQUIPMENT_STATS);
	}

	getPhasePieceRateImpact(piece: FarmingArmor | FarmingEquipment): number {
		const slot = piece.slot;
		const uuid = piece.item.uuid;
		const armorSetId = this.activePhaseLoadout.armorSetId;
		if (!slot || !uuid) return 0;
		if (this.pestPlayer.getArmorSetLoadout(armorSetId)?.pieces[slot] === uuid) return 0;

<<<<<<< HEAD
=======
		if (this.#lastGearRateStateKey !== this.pestRateStateKey) {
			this.#gearRateImpactMemo.clear();
			this.#lastGearRateStateKey = this.pestRateStateKey;
		}
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
		const key = `${this.pestRateStateKey}:armor:${armorSetId}:${slot}:${uuid}`;
		const cached = this.#gearRateImpactMemo.get(key);
		if (cached !== undefined) return cached;

		const armorSets = this.getStoredArmorSets().map((set) =>
			set.id === armorSetId
				? {
<<<<<<< HEAD
						...set,
						pieces: {
							...set.pieces,
							[slot]: uuid,
						},
					}
				: set
		);
		const delta = this.#getRateDeltaForPlayer(this.#createEvaluationPlayer({ armorSets }));
		if (this.#gearRateImpactMemo.size > 1000) this.#gearRateImpactMemo.clear();
=======
					...set,
					pieces: {
						...set.pieces,
						[slot]: uuid,
					},
				}
				: set
		);
		const delta = this.#getRateDeltaForPlayer(this.#createEvaluationPlayer({ armorSets }));
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
		this.#gearRateImpactMemo.set(key, delta);
		return delta;
	}

	getSharedEquipmentPieceRateImpact(piece: FarmingArmor | FarmingEquipment): number {
		const slot = piece.slot;
		const uuid = piece.item.uuid;
		if (!slot || !uuid) return 0;
		if (this.sharedEquipment[slot] === uuid) return 0;

<<<<<<< HEAD
=======
		if (this.#lastGearRateStateKey !== this.pestRateStateKey) {
			this.#gearRateImpactMemo.clear();
			this.#lastGearRateStateKey = this.pestRateStateKey;
		}
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
		const key = `${this.pestRateStateKey}:equipment:${slot}:${uuid}`;
		const cached = this.#gearRateImpactMemo.get(key);
		if (cached !== undefined) return cached;

		const sharedEquipment = {
			...this.sharedEquipment,
			[slot]: uuid,
		};
		const delta = this.#getRateDeltaForPlayer(this.#createEvaluationPlayer({ sharedEquipment }));
<<<<<<< HEAD
		if (this.#gearRateImpactMemo.size > 1000) this.#gearRateImpactMemo.clear();
=======
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
		this.#gearRateImpactMemo.set(key, delta);
		return delta;
	}

	getPetBreakdown(pet: FarmingPet, phase: PestFarmingPhase): StatBreakdown {
		const breakdown: StatBreakdown = {};
		const phaseStats = this.getPhaseStats(phase);
		const stats: readonly Stat[] = phaseStats.includes(Stat.FarmingFortune)
			? phaseStats
			: [...phaseStats, Stat.FarmingFortune];
		for (const stat of stats) {
			const value = pet.getFortune(stat, this.pestPlayer.getPhasePlayer(phase));
			if (value) breakdown[STAT_NAMES[stat]] = { value, stat };
		}
		return breakdown;
	}

	getPetRateImpact(pet: FarmingPet, phase: PestFarmingPhase): number {
		const uuid = pet.pet.uuid;
		if (!uuid) return 0;
		if (this.phaseLoadouts[phase]?.petId === uuid) return 0;

<<<<<<< HEAD
=======
		if (this.#lastPetRateStateKey !== this.pestRateStateKey) {
			this.#petRateImpactMemo.clear();
			this.#lastPetRateStateKey = this.pestRateStateKey;
		}
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
		const key = `${this.pestRateStateKey}:pet:${phase}:${uuid}`;
		const cached = this.#petRateImpactMemo.get(key);
		if (cached !== undefined) return cached;

		const phaseLoadouts = {
			...this.phaseLoadouts,
			[phase]: {
				...this.phaseLoadouts[phase],
				petId: uuid,
			},
		};
		const delta = this.#getRateDeltaForPlayer(this.#createEvaluationPlayer({ phaseLoadouts }));
<<<<<<< HEAD
		if (this.#petRateImpactMemo.size > 1000) this.#petRateImpactMemo.clear();
=======
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
		this.#petRateImpactMemo.set(key, delta);
		return delta;
	}

	getProgressUpgrades(progress: FortuneSourceProgress): FortuneUpgrade[] {
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
		this.pestPlayer.applyPhaseUpgrade(phase, upgrade);
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
		return (this.armorSets.length ? this.armorSets : this.pestPlayer.armorSetLoadouts).map((set) => ({
			...set,
			pieces: { ...set.pieces },
		}));
	}

	updateArmorSets(armorSets: PestArmorSetLoadout[]): void {
		this.armorSets = armorSets.map((set) => ({ ...set, pieces: { ...set.pieces } }));
		this.refreshPestPlayerWith({ armorSets });
	}

	selectArmorSetPiece(armorSetId: string, slot: GearSlot, uuid: string): void {
		if (!PEST_ARMOR_SLOTS.includes(slot as (typeof PEST_ARMOR_SLOTS)[number])) return;
		if (this.pestPlayer.getArmorSetConflict(uuid, armorSetId)) return;

		const armorSets = this.getStoredArmorSets();
		const next = armorSets.map((set) =>
			set.id === armorSetId
				? {
<<<<<<< HEAD
						...set,
						pieces: {
							...set.pieces,
							[slot]: uuid,
						},
					}
=======
					...set,
					pieces: {
						...set.pieces,
						[slot]: uuid,
					},
				}
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
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

	selectSharedEquipment(slot: GearSlot, uuid: string): void {
		if (!PEST_EQUIPMENT_SLOTS.includes(slot as (typeof PEST_EQUIPMENT_SLOTS)[number])) return;
		const sharedEquipment = {
			...this.sharedEquipment,
			[slot]: uuid,
		};
		this.sharedEquipment = sharedEquipment;
		this.refreshPestPlayerWith({ sharedEquipment });
		trackAnalytics('pest_farming.equipment_selected', { slot });
	}

	clearSharedEquipment(slot: GearSlot): void {
		const sharedEquipment = { ...this.sharedEquipment };
		delete sharedEquipment[slot];
		this.sharedEquipment = sharedEquipment;
		this.refreshPestPlayerWith({ sharedEquipment });
		trackAnalytics('pest_farming.equipment_cleared', { slot });
	}

	selectPhaseArmorSet(phase: PestFarmingPhase, armorSetId: string): void {
		if (!this.pestPlayer.setPhaseArmorSet(phase, armorSetId)) return;
		const baseLoadouts = this.pestPlayer.phaseLoadouts;
		const phaseLoadouts = {
			...baseLoadouts,
			[phase]: {
				...baseLoadouts[phase],
				armorSetId,
			},
		};
		this.phaseLoadouts = phaseLoadouts;
		this.options = { ...this.options, phaseLoadouts } as PestFarmingPlayerOptions;
		this.#updatePestFarmingData({ phaseLoadouts: this.#getPersistablePhaseLoadouts(phaseLoadouts) });
		this.pestVersion++;
		trackAnalytics('pest_farming.phase_armor_set_selected', { phase });
	}

	selectPhasePet(phase: PestFarmingPhase, petId: string): void {
		if (!this.pestPlayer.setPhasePet(phase, petId)) return;
		const baseLoadouts = this.pestPlayer.phaseLoadouts;
		const phaseLoadouts = {
			...baseLoadouts,
			[phase]: {
				...baseLoadouts[phase],
				petId,
			},
		};
		this.phaseLoadouts = phaseLoadouts;
		this.options = { ...this.options, phaseLoadouts } as PestFarmingPlayerOptions;
		this.pestVersion++;
		trackAnalytics('pest_farming.phase_pet_selected', { phase });
	}

	getPestRateImpact(upgrade: FortuneUpgrade): PestFarmingUpgradeRateImpact | undefined {
<<<<<<< HEAD
		const calculator = this.#createRateCalculator();
		const result = calculator.calculate();
		return this.#calculatePestRateImpact(calculator, result, this.activePhase, upgrade);
=======
		return this.#calculatePestRateImpact(
			this.pestRateCalculator,
			this.pestRateResult,
			this.activePhase,
			upgrade
		);
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
	}

	#calculatePestRateImpact(
		calculator: PestFarmingRateCalculator,
		result: ReturnType<PestFarmingRateCalculator['calculate']>,
		phase: PestFarmingPhase,
		upgrade: FortuneUpgrade
	): PestFarmingUpgradeRateImpact {
<<<<<<< HEAD
=======
		if (this.#lastRateStateKey !== result.stateKey) {
			this.#rateImpactMemo.clear();
			this.#lastRateStateKey = result.stateKey;
		}
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
		const key = `${result.stateKey}:${phase}:${getUpgradeIdentity(upgrade)}`;
		const cached = this.#rateImpactMemo.get(key);
		if (cached) return cached;

		const impact = calculator.calculateUpgradeImpact({
			phase,
			upgrade,
			before: result,
		});
<<<<<<< HEAD
		if (this.#rateImpactMemo.size > 500) this.#rateImpactMemo.clear();
=======
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
		this.#rateImpactMemo.set(key, impact);
		return impact;
	}

	getPestRateImpactValue(upgrade: FortuneUpgrade): number {
		const impact = this.getPestRateImpact(upgrade);
		const value = impact?.valuationDelta.coinsPerHour ?? 0;
		return Number.isFinite(value) ? value : 0;
	}

	#createEvaluationPlayer(patch: Partial<PestFarmingPlayerOptions>): PestFarmingPlayer {
		return createPestFarmingPlayer({
			...this.options,
			armorSets: this.getStoredArmorSets(),
			phaseLoadouts: this.phaseLoadouts,
			sharedEquipment: this.sharedEquipment,
			selectedVacuumId: this.selectedVacuumId,
			...patch,
		} as PestFarmingPlayerOptions);
	}

	#createRateCalculator(player = this.pestPlayer): PestFarmingRateCalculator {
		const spawnArmorSetIds = this.#getDefaultSpawnArmorCandidateIds(player);
		return new PestFarmingRateCalculator({
			player,
			options: {
				crop: this.selectedCropKey,
				cycle: this.pestRateSettings,
				attraction: this.pestAttraction,
			},
			priceBook: this.pestRatePriceBook,
			armorSelection: spawnArmorSetIds ? { spawnArmorSetIds } : undefined,
		});
	}

	#getRateDeltaForPlayer(player: PestFarmingPlayer): number {
		const before = this.pestRateResult.valuation.coinsPerHour;
		const after = this.#createRateCalculator(player).calculate().valuation.coinsPerHour;
		const delta = after - before;
		return Number.isFinite(delta) ? delta : 0;
	}

	setPestRateSetting<K extends keyof PestFarmingRateSettings>(key: K, value: PestFarmingRateSettings[K]): void {
		this.#updatePestFarmingData({
			rateSettings: {
				...this.rates.pestFarming.rateSettings,
				[key]: value,
			},
		});
		trackAnalytics('pest_farming.rate_setting_changed', { key });
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

	#buildOptions(previous: Partial<PestFarmingPlayerOptions> = {}): PestFarmingPlayerOptions {
		const rates = this.rates;
		const selectedVacuumId = untrack(() => this.selectedVacuumId);
		const armorSets = untrack(() => this.armorSets);
		const phaseLoadouts = untrack(() => this.phaseLoadouts);
		const sharedEquipment = untrack(() => this.sharedEquipment);

		return {
			...previous,
			tools: this.tools,
			vacuums: this.vacuums,
			armor: this.armor,
			equipment: this.equipment,
			accessories: this.ctx.accessories as EliteItemDto[],
			pets: this.pets,
			selectedVacuumId,
			armorSets,
			phaseLoadouts: Object.keys(phaseLoadouts).length > 0 ? phaseLoadouts : undefined,
			sharedEquipment,
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
			wrigglingLarva: Number(this.ctx.member.current?.unparsed?.consumed?.wriggling_larva ?? 0),
			sprayedPlot: rates.pestFarming.sprayedPlot,
			pesthunterAccessoryEnabled: true,
			infestedPlotProbability: rates.infestedPlotProbability,
			cocoaFortuneUpgrade: this.ctx.member.current?.chocolateFactory?.cocoaFortuneUpgrades,
			temporaryFortune: rates.useTemp ? rates.temp : undefined,
			zorro: rates.zorroMode
				? {
<<<<<<< HEAD
						enabled: this.ctx.member.current?.chocolateFactory?.unlockedZorro ?? false,
						mode: rates.zorroMode,
					}
=======
					enabled: this.ctx.member.current?.chocolateFactory?.unlockedZorro ?? false,
					mode: rates.zorroMode,
				}
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
				: undefined,
		} as PestFarmingPlayerOptions;
	}

	#loadItemPrices(): void {
		const items = this.debouncedItems.current;
		const missingItems = items.filter((item) => !this.itemsData[item]);
		if (missingItems.length === 0) return;

		const requestKey = [...missingItems].sort().join(':');
		if (requestKey === this.#lastItemRequestKey) return;
		this.#lastItemRequestKey = requestKey;

		void getItems(missingItems).then((data) => {
			this.itemsData = { ...this.itemsData, ...data };
			this.itemsVersion++;
		});
	}

	#syncExternalState(): void {
		if (!this.ctx.ready) return;
		const profileKey = this.#getProfileKey();
		if (profileKey !== this.#profileKey) {
			this.#profileKey = profileKey;
			this.#resetSessionSelections();
		}
		const previous = untrack(() => this.options);
		const nextOptions = this.#buildOptions(previous);
		if (this.#skipNextRatesDataRefresh) {
			this.#skipNextRatesDataRefresh = false;
			return;
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 437551d2784e838ca661d955d0d3ac2ddc389556
