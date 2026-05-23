import { browser } from '$app/environment';
import {
	PEST_MAIN_ARMOR_SET_ID,
	PEST_SPAWN_ARMOR_SET_ID,
	PestFarmingPhase,
	ZorroMode,
	type FarmingTool,
	type GearSlot,
	type PestArmorSetLoadout,
	type PestPhaseLoadout,
	type TemporaryFarmingFortune,
} from 'farming-weight';
import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';
import * as z from 'zod';

interface PestFarmingData {
	selectedCrop?: string;
	selectedVacuum?: string;
	armorSets: PestArmorSetLoadout[];
	phaseLoadouts: Record<PestFarmingPhase, PestPhaseLoadout>;
	sharedEquipment: Partial<Record<GearSlot, string>>;
	sprayedPlot: boolean;
	pesthunterAccessoryEnabled: boolean;
	mantidPestKills: number;
}

interface RatesData {
	v: number;
	settings: boolean;
	tool?: FarmingTool;
	communityCenter: number;
	selectedPet?: string;
	strength: number;
	useTemp: boolean;
	temp: Required<TemporaryFarmingFortune>;
	sprayedPlot: boolean;
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
	communityCenter: 0,
	strength: 0,
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
	sprayedPlot: true,
	infestedPlotProbability: 0.2,
	zorroMode: ZorroMode.Normal,
	pestFarming: {
		armorSets: [
			{ id: PEST_MAIN_ARMOR_SET_ID, name: 'Farm/Kill Armor', pieces: {} },
			{ id: PEST_SPAWN_ARMOR_SET_ID, name: 'Spawn Armor', pieces: {} },
		],
		phaseLoadouts: {
			[PestFarmingPhase.Farm]: { armorSetId: PEST_MAIN_ARMOR_SET_ID },
			[PestFarmingPhase.Spawn]: { armorSetId: PEST_SPAWN_ARMOR_SET_ID },
			[PestFarmingPhase.Kill]: { armorSetId: PEST_MAIN_ARMOR_SET_ID },
		},
		sharedEquipment: {},
		sprayedPlot: true,
		pesthunterAccessoryEnabled: true,
		mantidPestKills: 0,
	},
} as RatesData;

function normalizePestFarmingData(data?: Partial<PestFarmingData>): PestFarmingData {
	const inputArmorSets = data?.armorSets?.length ? data.armorSets : defaultData.pestFarming.armorSets;
	const mainArmorSet =
		inputArmorSets.find((set) => set.id === PEST_MAIN_ARMOR_SET_ID) ??
		inputArmorSets[0] ??
		defaultData.pestFarming.armorSets[0];
	const spawnArmorSet =
		inputArmorSets.find((set) => set.id === PEST_SPAWN_ARMOR_SET_ID) ??
		inputArmorSets.find((set) => set.id !== mainArmorSet?.id) ??
		defaultData.pestFarming.armorSets[1];
	const armorSets: PestArmorSetLoadout[] = [
		{
			id: PEST_MAIN_ARMOR_SET_ID,
			name: mainArmorSet?.name || 'Farm/Kill Armor',
			pieces: { ...(mainArmorSet?.pieces ?? {}) },
		},
		{
			id: PEST_SPAWN_ARMOR_SET_ID,
			name: spawnArmorSet?.name || 'Spawn Armor',
			pieces: { ...(spawnArmorSet?.pieces ?? {}) },
		},
	];
	const armorSetIds = new Set(armorSets.map((set) => set.id));
	const normalizePhaseLoadout = (phase: PestFarmingPhase, fallbackArmorSetId: string): PestPhaseLoadout => {
		const loadout = data?.phaseLoadouts?.[phase];
		const armorSetId =
			loadout?.armorSetId && armorSetIds.has(loadout.armorSetId) ? loadout.armorSetId : fallbackArmorSetId;
		return {
			...defaultData.pestFarming.phaseLoadouts[phase],
			...(loadout ?? {}),
			armorSetId,
		};
	};

	return {
		...defaultData.pestFarming,
		...(data ?? {}),
		armorSets,
		phaseLoadouts: {
			[PestFarmingPhase.Farm]: normalizePhaseLoadout(PestFarmingPhase.Farm, PEST_MAIN_ARMOR_SET_ID),
			[PestFarmingPhase.Spawn]: normalizePhaseLoadout(PestFarmingPhase.Spawn, PEST_SPAWN_ARMOR_SET_ID),
			[PestFarmingPhase.Kill]: normalizePhaseLoadout(PestFarmingPhase.Kill, PEST_MAIN_ARMOR_SET_ID),
		},
		sharedEquipment: {
			...defaultData.pestFarming.sharedEquipment,
			...(data?.sharedEquipment ?? {}),
		},
		pesthunterAccessoryEnabled: true,
		mantidPestKills: 0,
	};
}

function normalizeRatesData(data?: PartialRatesData | null): RatesData {
	const resetPestFarming = data?.v !== defaultData.v;
	return {
		...defaultData,
		...(data ?? {}),
		v: defaultData.v,
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
