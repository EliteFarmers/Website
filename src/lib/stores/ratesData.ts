import { browser } from '$app/environment';
import { Crop, ZorroMode, type FarmingTool, type TemporaryFarmingFortune } from 'farming-weight';
import { FARMING_ATTRIBUTE_SHARDS } from 'farming-weight/dist/constants/attributes';
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
	exported: Record<Crop, boolean>;
	useTemp: boolean;
	temp: Required<TemporaryFarmingFortune>;
	sprayedPlot: boolean;
	infestedPlotProbability?: number;
	zorroMode: ZorroMode;
	bzMode: 'order' | 'insta';
	attributes: Record<string, number>;
}

export const MissingRatesDataSchema = z.object({
	communityCenter: z.number().optional(),
	strength: z.number().optional(),
	exported: z.record(z.enum(Object.values(Crop)), z.boolean().optional()).optional(),
	attributes: z.record(z.string(), z.number()).optional(),
	from: z.string().optional(),
});

// Initialize the store with the data from localStorage if it exists
const defaultData = {
	v: 6,
	settings: false,
	communityCenter: 0,
	strength: 0,
	bzMode: 'order',
	exported: {
		[Crop.Cactus]: false,
		[Crop.Carrot]: false,
		[Crop.CocoaBeans]: false,
		[Crop.Melon]: false,
		[Crop.Mushroom]: false,
		[Crop.NetherWart]: false,
		[Crop.Potato]: false,
		[Crop.Pumpkin]: false,
		[Crop.SugarCane]: false,
		[Crop.Wheat]: false,
	} as Record<Crop, boolean>,
	useTemp: true,
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
	axed: false,
	zorroMode: ZorroMode.Normal,
	attributes: Object.fromEntries(
		Object.entries(FARMING_ATTRIBUTE_SHARDS)
			.filter((a) => a[1].effect === 'rates' || a[1].effect === 'fortune')
			.map((a) => [a[0], 0])
	),
} as RatesData;

export function initRatesData(data = defaultData) {
	if (browser) {
		const savedRatesData = localStorage.getItem('ratesData');

		if (savedRatesData) {
			data = JSON.parse(savedRatesData) as RatesData;
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

		return rates;
	});

	if (store) return store;

	initRatesData();
	return getContext<Writable<RatesData>>('ratesData');
}
