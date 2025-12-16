import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

export const DEFAULT_SELECTED_CROPS = {
	Cactus: false,
	Carrot: false,
	'Cocoa Beans': false,
	Melon: false,
	Mushroom: false,
	'Nether Wart': false,
	Potato: false,
	Pumpkin: false,
	'Sugar Cane': false,
	Wheat: false,
	Sunflower: false,
	Moonflower: false,
	'Wild Rose': false,
};

export function initAnyCropSelected() {
	setContext('anyCropSelected', writable(false));
}

export function getAnyCropSelected() {
	return getContext<Writable<boolean>>('anyCropSelected');
}

export function initSelectedCrops(anyStore: Writable<boolean>) {
	const store = writable<Record<string, boolean>>(DEFAULT_SELECTED_CROPS);

	store.subscribe((crops) => {
		anyStore.set(Object.values(crops).some((selected) => selected));
	});

	setContext('selectedCrops', store);
}

export function getSelectedCrops() {
	return getContext<Writable<Record<string, boolean>>>('selectedCrops');
}
