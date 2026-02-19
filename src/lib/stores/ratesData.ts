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
	},
	sprayedPlot: true,
	infestedPlotProbability: 0.2,
	zorroMode: ZorroMode.Normal,
} as RatesData;

export function initRatesData(data = defaultData) {
	if (browser) {
		const savedRatesData = localStorage.getItem('ratesData');

		if (savedRatesData) {
			data = JSON.parse(savedRatesData) as RatesData;

			// Add in any missing fields from defaultData
			data = { ...defaultData, ...data, v: defaultData.v };
		}
	}

	const store = writable<RatesData>(data);

	store.subscribe((rates) => {
		if (browser) {
			localStorage.setItem('ratesData', JSON.stringify(rates));
		}
	});

	setContext('ratesData', store);
}

export function getRatesData() {
	const store = getContext<Writable<RatesData>>('ratesData');

	store.update((rates) => {
		if (!rates || rates.v !== defaultData.v) {
			rates = defaultData;
		}

		return { ...defaultData, ...rates, v: defaultData.v };
	});

	if (store) return store;

	initRatesData();
	return getContext<Writable<RatesData>>('ratesData');
}
