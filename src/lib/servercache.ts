import { building } from '$app/environment';
import type { components } from './api/api';
import { GetProducts, GetUpcomingEvents, GetWeightStyles } from './api/elite';

const cacheEntries = {
	events: {
		data: [] as components['schemas']['EventDetailsDto'][],
		update: async () => {
			const { data } = await GetUpcomingEvents();
			return data ?? [];
		},
	},
	products: {
		data: [] as components['schemas']['ProductDto'][],
		update: async () => {
			const { data } = await GetProducts();
			return data ?? [];
		},
	},
	styles: {
		data: [] as components['schemas']['WeightStyleWithDataDto'][],
		update: async () => {
			const { data } = await GetWeightStyles();
			return data ?? [];
		},
	},
};

export const cache = {
	get events() {
		return cacheEntries.events.data;
	},
	get products() {
		return cacheEntries.products.data;
	},
	get styles() {
		return cacheEntries.styles.data;
	},
};

let interval: undefined | number | NodeJS.Timeout = undefined;

export async function reloadCachedItems() {
	console.log('Fetching new data for cached items...');
	for (const item of Object.values(cacheEntries)) {
		item.data = await item.update();
	}
	console.log('New data loaded.');
}

export async function initCachedItems() {
	if (building) return;
	await reloadCachedItems();

	if (interval) {
		clearInterval(interval);
	}

	interval = setInterval(
		() => {
			reloadCachedItems();
		},
		1000 * 60 * 60
	); // 1 hour
}
