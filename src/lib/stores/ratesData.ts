import { browser } from '$app/environment';
import {
	PEST_MAIN_ARMOR_SET_ID,
	PEST_SPAWN_ARMOR_SET_ID,
	DEFAULT_PEST_CYCLE_SETTINGS,
	Pest,
	type PestAttractionSettings,
	PestFarmingPhase,
	Spray,
	SprayonatorTier,
	ZorroMode,
	type FarmingTool,
	type PestCycleSettings,
	type TemporaryFarmingFortune,
} from 'farming-weight';
import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';
import * as z from 'zod';

export type PestFarmingRateSettings = Omit<PestCycleSettings, 'sprayedPlot'>;
export type PestFarmingTimeOfDay = 'day' | 'night';

export interface PestFarmingData {
	selectedCrop?: string;
	phaseLoadouts: Partial<Record<PestFarmingPhase, { armorSetId: string }>>;
	sprayedPlot: boolean;
	sprayonatorTier: SprayonatorTier;
	pesthunterAccessoryEnabled: boolean;
	timeOfDay: PestFarmingTimeOfDay;
	attraction: PestAttractionSettings;
	rateSettings: PestFarmingRateSettings;
}

export interface RatesData {
	v: number;
	settings: boolean;
	tool?: FarmingTool;
	chipRarities: Record<string, string>;
	communityCenter: number;
	selectedPet?: string;
	strength: number;
	speed: number;
	useTemp: boolean;
	temp: Required<TemporaryFarmingFortune>;
	overdriveActive: boolean;
	sprayedPlot: boolean;
	sprayonatorTier: SprayonatorTier;
	infestedPlotProbability?: number;
	zorroMode: ZorroMode;
	bzMode: 'order' | 'insta';
	rosewaterFlasks: number;
	pestFarming: PestFarmingData;
}

type PartialRatesData = Partial<Omit<RatesData, 'temp' | 'pestFarming'>> & {
	temp?: Partial<RatesData['temp']>;
	pestFarming?: Partial<PestFarmingData>;
};

export const MissingRatesDataSchema = z.object({
	communityCenter: z.number().optional(),
	strength: z.number().optional(),
	flasks: z.number().optional(),
	from: z.string().optional(),
});

// Initialize the store with the data from localStorage if it exists
const defaultData = {
	v: 9,
	settings: false,
	chipRarities: {},
	communityCenter: 0,
	strength: 0,
	speed: 400,
	bzMode: 'order',
	useTemp: true,
	rosewaterFlasks: 0,
	temp: {
		pestTurnIn: 0,
		harvestPotion: false,
		chocolateTruffle: false,
		centuryCake: true,
		springFilter: false,
		magic8Ball: false,
		flourSpray: false,
		anitaContest: false,
		celestialMasonJar: false,
		melonJuiceMixin: false,
		finnsFocaccia: false,
		stinkyCheesePotion: false,
	},
	overdriveActive: false,
	sprayedPlot: true,
	sprayonatorTier: SprayonatorTier.Regular,
	infestedPlotProbability: 0.2,
	zorroMode: ZorroMode.Normal,
	pestFarming: {
		phaseLoadouts: {},
		sprayedPlot: true,
		sprayonatorTier: SprayonatorTier.Regular,
		pesthunterAccessoryEnabled: true,
		timeOfDay: 'day',
		attraction: {
			sprayonatorMaterial: Spray.PlantMatter,
			hooveriusVinylTarget: Pest.Slug,
		},
		rateSettings: {
			blocksPerSecond: DEFAULT_PEST_CYCLE_SETTINGS.blocksPerSecond,
			spawnBlocksPerSecond: DEFAULT_PEST_CYCLE_SETTINGS.spawnBlocksPerSecond,
			farmSwapBeforeCooldownSeconds: DEFAULT_PEST_CYCLE_SETTINGS.farmSwapBeforeCooldownSeconds,
			farmToSpawnSwapSeconds: DEFAULT_PEST_CYCLE_SETTINGS.farmToSpawnSwapSeconds,
			spawnToKillSwapSeconds: DEFAULT_PEST_CYCLE_SETTINGS.spawnToKillSwapSeconds,
			fixedKillSetupSeconds: DEFAULT_PEST_CYCLE_SETTINGS.fixedKillSetupSeconds,
			fixedPestSearchSeconds: DEFAULT_PEST_CYCLE_SETTINGS.fixedPestSearchSeconds,
			secondsPerPestKill: DEFAULT_PEST_CYCLE_SETTINGS.secondsPerPestKill,
			returnToFarmSeconds: DEFAULT_PEST_CYCLE_SETTINGS.returnToFarmSeconds,
			activePestsAtCycleStart: DEFAULT_PEST_CYCLE_SETTINGS.activePestsAtCycleStart,
			maxActivePests: DEFAULT_PEST_CYCLE_SETTINGS.maxActivePests,
			atmosphericFilterAutumn: DEFAULT_PEST_CYCLE_SETTINGS.atmosphericFilterAutumn,
			pestRepellent: DEFAULT_PEST_CYCLE_SETTINGS.pestRepellent,
			finneganActive: DEFAULT_PEST_CYCLE_SETTINGS.finneganActive,
		},
	},
} as RatesData;

function isLegacyDefaultPhaseLoadouts(loadouts?: Partial<PestFarmingData['phaseLoadouts']>): boolean {
	return (
		loadouts?.[PestFarmingPhase.Farm]?.armorSetId === PEST_MAIN_ARMOR_SET_ID &&
		loadouts?.[PestFarmingPhase.Spawn]?.armorSetId === PEST_SPAWN_ARMOR_SET_ID &&
		loadouts?.[PestFarmingPhase.Kill]?.armorSetId === PEST_MAIN_ARMOR_SET_ID
	);
}

function normalizePestAttractionSettings(
	data?: (Partial<PestAttractionSettings> & { selectedPest?: Pest }) | null
): PestAttractionSettings {
	const attraction = { ...(data ?? {}) };
	delete attraction.selectedPest;
	return {
		...defaultData.pestFarming.attraction,
		...attraction,
		excludedPests: attraction.excludedPests ?? defaultData.pestFarming.attraction.excludedPests,
	};
}

function normalizePestFarmingData(data?: Partial<PestFarmingData>): PestFarmingData {
	const armorSetIds = new Set([PEST_MAIN_ARMOR_SET_ID, PEST_SPAWN_ARMOR_SET_ID]);
	const phaseLoadouts: PestFarmingData['phaseLoadouts'] = {};

	if (!isLegacyDefaultPhaseLoadouts(data?.phaseLoadouts)) {
		for (const phase of [PestFarmingPhase.Farm, PestFarmingPhase.Spawn, PestFarmingPhase.Kill]) {
			const armorSetId = data?.phaseLoadouts?.[phase]?.armorSetId;
			if (armorSetId && armorSetIds.has(armorSetId)) {
				phaseLoadouts[phase] = { armorSetId };
			}
		}
	}

	return {
		selectedCrop: data?.selectedCrop,
		phaseLoadouts,
		sprayedPlot: data?.sprayedPlot ?? defaultData.pestFarming.sprayedPlot,
		sprayonatorTier: data?.sprayonatorTier ?? defaultData.pestFarming.sprayonatorTier,
		pesthunterAccessoryEnabled: true,
		timeOfDay: data?.timeOfDay ?? defaultData.pestFarming.timeOfDay,
		attraction: normalizePestAttractionSettings(data?.attraction),
		rateSettings: {
			...defaultData.pestFarming.rateSettings,
			...(data?.rateSettings ?? {}),
		},
	};
}

function normalizeRatesData(data?: PartialRatesData | null): RatesData {
	const resetPestFarming = data?.v !== defaultData.v;
	return {
		...defaultData,
		...(data ?? {}),
		v: defaultData.v,
		chipRarities: data?.chipRarities ?? {},
		temp: {
			...defaultData.temp,
			...(data?.temp ?? {}),
		},
		pestFarming: resetPestFarming ? normalizePestFarmingData() : normalizePestFarmingData(data?.pestFarming),
	};
}

export function initRatesData(data: PartialRatesData = defaultData) {
	let initialData = normalizeRatesData(data);

	if (browser) {
		const savedRatesData = localStorage.getItem('ratesData');

		if (savedRatesData) {
			initialData = normalizeRatesData(JSON.parse(savedRatesData) as PartialRatesData);
		}
	}

	const store = writable<RatesData>(initialData);

	store.subscribe((rates) => {
		if (browser) {
			localStorage.setItem('ratesData', JSON.stringify(rates));
		}
	});

	setContext('ratesData', store);
}

export function getRatesData() {
	let store = getContext<Writable<RatesData>>('ratesData');

	if (!store) {
		initRatesData();
		store = getContext<Writable<RatesData>>('ratesData');
	}

	store.update((rates) => {
		if (!rates || rates.v !== defaultData.v) {
			return normalizeRatesData();
		}

		return normalizeRatesData(rates);
	});

	return store;
}
