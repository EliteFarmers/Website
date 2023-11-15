import { browser } from "$app/environment";
import type { Crop } from "farming-weight";
import { writable } from "svelte/store";

interface RatesData { 
	milestones: Partial<Record<Crop, number>>;
	cropUpgrades: Partial<Record<Crop, number>>;
	gardenLevel: number;
	plotsUnlocked: number;
	strength: number;
}

// Initialize the store with the data from localStorage if it exists
let defaultData = {
	milestones: {},
	cropUpgrades: {},
	gardenLevel: 0,
	plotsUnlocked: 0,
	strength: 0,
} satisfies RatesData;

if (browser) {
	const savedRatesData = localStorage.getItem('ratesData');

	if (savedRatesData) {
		defaultData = JSON.parse(savedRatesData) as RatesData;
	}
}

export const ratesData = writable<RatesData>(defaultData);

ratesData.subscribe((rates) => {
	if (browser) {
		localStorage.setItem('ratesData', JSON.stringify(rates));
	}
});