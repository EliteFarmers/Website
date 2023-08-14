import type { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
import { writable } from 'svelte/store';

export const selectedCrops = writable<Record<keyof typeof PROPER_CROP_TO_IMG, boolean>>({
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
});

export const anyCropSelected = writable(false);

selectedCrops.subscribe((crops) => {
	anyCropSelected.set(Object.values(crops).some((selected) => selected));
});
