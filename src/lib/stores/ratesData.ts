import { browser } from '$app/environment';
import type { SprayonatorTierSetting } from '$lib/rates/sprayonator';
import {
	DEFAULT_PEST_CYCLE_SETTINGS,
	Pest,
	Spray,
	ZorroMode,
	type PestAttractionSettings,
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
	sprayedPlot: boolean;
	sprayonator: SprayonatorTierSetting;
	pesthunterAccessoryEnabled: boolean;
	timeOfDay: PestFarmingTimeOfDay;
	attraction: PestAttractionSettings;
	rateSettings: PestFarmingRateSettings;
}

export interface RatesData {
	v: number;
	chipRarities: Record<string, string>;
	communityCenter: number;
	selectedPet?: string;
	strength: number;
	speed: number;
	feastBurgers: number;
	useTemp: boolean;
	temp: Required<TemporaryFarmingFortune>;
	overdriveActive: boolean;
	sprayedPlot: boolean;
	sprayonator: SprayonatorTierSetting;
	infestedPlotProbability?: number;
	zorroMode: ZorroMode;
	bzMode: 'order' | 'insta';
	rosewaterFlasks: number;
	pestFarming: PestFarmingData;
}

export type PartialRatesData = Partial<Omit<RatesData, 'temp' | 'pestFarming'>> & {
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
	v: 12,
	chipRarities: {},
	communityCenter: 0,
	strength: 0,
	speed: 400,
	feastBurgers: 0,
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
	sprayonator: 'auto',
	infestedPlotProbability: 0.2,
	zorroMode: ZorroMode.Normal,
	pestFarming: {
		sprayedPlot: true,
		sprayonator: 'auto',
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
	return {
		selectedCrop: data?.selectedCrop,
		sprayedPlot: data?.sprayedPlot ?? defaultData.pestFarming.sprayedPlot,
		sprayonator: data?.sprayonator ?? defaultData.pestFarming.sprayonator,
		pesthunterAccessoryEnabled: true,
		timeOfDay: data?.timeOfDay ?? defaultData.pestFarming.timeOfDay,
		attraction: normalizePestAttractionSettings(data?.attraction),
		rateSettings: {
			...defaultData.pestFarming.rateSettings,
			...(data?.rateSettings ?? {}),
		},
	};
}

// Settings without a default value, which are still kept when loading saved settings
const OPTIONAL_RATES_DATA_KEYS = ['selectedPet'] as const satisfies readonly (keyof RatesData)[];

/** Copies only the given keys, so fields that are no longer used drop out of saved settings */
function pickKnownKeys<T extends object>(data: Partial<T> | null | undefined, keys: readonly (keyof T)[]): Partial<T> {
	const known: Partial<T> = {};
	for (const key of keys) {
		if (data?.[key] !== undefined) known[key] = data[key];
	}
	return known;
}

export function normalizeRatesData(data?: PartialRatesData | null): RatesData {
	const knownKeys = [...(Object.keys(defaultData) as (keyof RatesData)[]), ...OPTIONAL_RATES_DATA_KEYS];

	return {
		...defaultData,
		...pickKnownKeys(data as Partial<RatesData> | null | undefined, knownKeys),
		v: defaultData.v,
		chipRarities: data?.chipRarities ?? {},
		temp: {
			...defaultData.temp,
			...pickKnownKeys(data?.temp, Object.keys(defaultData.temp) as (keyof RatesData['temp'])[]),
		},
		pestFarming: normalizePestFarmingData(data?.pestFarming),
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
	setContext('ratesSettingsOpen', writable(false));
}

export function getRatesData() {
	let store = getContext<Writable<RatesData>>('ratesData');

	if (!store) {
		initRatesData();
		store = getContext<Writable<RatesData>>('ratesData');
	}

	return store;
}

export function getRatesSettingsOpen() {
	let store = getContext<Writable<boolean>>('ratesSettingsOpen');

	if (!store) {
		initRatesData();
		store = getContext<Writable<boolean>>('ratesSettingsOpen');
	}

	return store;
}
