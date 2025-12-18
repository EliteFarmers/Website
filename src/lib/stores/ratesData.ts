import { browser } from '$app/environment';
import { ZorroMode, type FarmingTool, type TemporaryFarmingFortune } from 'farming-weight';
import { FARMING_ATTRIBUTE_SHARDS } from 'farming-weight/dist/constants/attributes';
import type { GardenChipId } from 'farming-weight/dist/constants/chips';
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
	attributes: Record<string, number>;
	chips: Record<GardenChipId, number>;
}

export const MissingRatesDataSchema = z.object({
	communityCenter: z.number().optional(),
	strength: z.number().optional(),
	attributes: z.record(z.string(), z.number()).optional(),
	chips: z.record(z.string(), z.number()).optional(),
	from: z.string().optional(),
});

// Initialize the store with the data from localStorage if it exists
const defaultData = {
	v: 7,
	settings: false,
	communityCenter: 0,
	strength: 0,
	bzMode: 'order',
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
	chips: {
		CROPSHOT_GARDEN_CHIP: 0,
		VERMIN_VAPORIZER_GARDEN_CHIP: 0,
		SYNTHESIS_GARDEN_CHIP: 0,
		SOWLEDGE_GARDEN_CHIP: 0,
		MECHAMIND_GARDEN_CHIP: 0,
		HYPERCHARGE_GARDEN_CHIP: 0,
		EVERGREEN_GARDEN_CHIP: 0,
		OVERDRIVE_GARDEN_CHIP: 0,
		QUICKDRAW_GARDEN_CHIP: 0,
		RAREFINDER_GARDEN_CHIP: 0,
	} as Record<GardenChipId, number>,
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
