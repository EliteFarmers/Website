import { browser } from '$app/environment';
import { ZorroMode, type FarmingTool, type TemporaryFarmingFortune } from 'farming-weight';
import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';
import * as z from 'zod';

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
}

type PartialRatesData = Partial<Omit<RatesData, 'temp'>> & {
	temp?: Partial<RatesData['temp']>;
};

export const MissingRatesDataSchema = z.object({
	communityCenter: z.number().optional(),
	strength: z.number().optional(),
	flasks: z.number().optional(),
	from: z.string().optional(),
});

// Initialize the store with the data from localStorage if it exists
const defaultData = {
	v: 8,
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
	},
	sprayedPlot: true,
	infestedPlotProbability: 0.2,
	zorroMode: ZorroMode.Normal,
} as RatesData;

function normalizeRatesData(data?: PartialRatesData | null): RatesData {
	return {
		...defaultData,
		...(data ?? {}),
		v: defaultData.v,
		temp: {
			...defaultData.temp,
			...(data?.temp ?? {}),
		},
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
