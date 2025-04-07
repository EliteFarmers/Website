import { building } from '$app/environment';
import type { components } from './api/api';
import { GetUpcomingEvents } from './api/elite';

const cacheEntries = {
	events: {
		data: [] as components['schemas']['EventDetailsDto'][],
		update: async () => {
			const { data } = await GetUpcomingEvents();
			return data ?? [];
		},
	},
};

export const cache = {
	get events() {
		return cacheEntries.events.data;
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
