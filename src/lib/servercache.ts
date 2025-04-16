import { building } from '$app/environment';
import type { components } from './api/api';
import { GetEventTeamWords, GetLeaderboards, GetProducts, GetUpcomingEvents, GetWeightStyles } from './api/elite';
import { ELITE_API_URL } from '$env/static/private';
import { parseLeaderboards } from './constants/leaderboards';

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
	teamwords: {
		data: {} as components['schemas']['EventTeamsWordListDto'],
		update: async () => {
			const { data } = await GetEventTeamWords();
			return data ?? { first: [] as string[], second: [] as string[], third: [] as string[] };
		},
	},
	leaderboards: {
		data: {} as ReturnType<typeof parseLeaderboards>,
		update: async () => {
			const { data } = await GetLeaderboards();
			return parseLeaderboards(data);
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
	get teamwords() {
		return cacheEntries.teamwords.data;
	},
	get leaderboards() {
		return cacheEntries.leaderboards.data;
	},
};

let interval: undefined | number | NodeJS.Timeout = undefined;

export async function reloadCachedItems() {
	console.log('Fetching new data for cached items...');
	try {
		await Promise.allSettled(
			Object.values(cacheEntries).map(async (item) => {
				item.data = await item.update();
			})
		);

		console.log('Cached items updated successfully.');
	} catch (error) {
		console.error('Error fetching cached items:', error);
		setTimeout(() => {
			reloadCachedItems();
		}, 1000 * 5); // Retry after 5 seconds
	}
}

export async function initCachedItems() {
	// Api url is imported just to prevent this file from accidentally being included in the client bundle
	if (building || !ELITE_API_URL) return;

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
