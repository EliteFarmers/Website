import { writable } from 'svelte/store';

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
};

export const selectedCrops = writable<Record<string, boolean>>(DEFAULT_SELECTED_CROPS);

export const anyCropSelected = writable(false);

selectedCrops.subscribe((crops) => {
	anyCropSelected.set(Object.values(crops).some((selected) => selected));
});
