import { browser } from '$app/environment';
import type { Crop, FarmingTool } from 'farming-weight';
import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

interface RatesData {
	milestones: Record<Crop, number>;
	cropUpgrades: Record<Crop, number>;
	tool?: FarmingTool;
	gardenLevel: number;
	plotsUnlocked: number;
	communityCenter: number;
	selectedPet?: string;
	strength: number;
}

// Initialize the store with the data from localStorage if it exists
const defaultData = {
	milestones: {} as Record<Crop, number>,
	cropUpgrades: {} as Record<Crop, number>,
	gardenLevel: 0,
	plotsUnlocked: 24,
	communityCenter: 0,
	strength: 0,
} satisfies RatesData;

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
	if (store) return store;

	initRatesData();
	return getContext<Writable<RatesData>>('ratesData');
}
