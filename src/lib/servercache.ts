import { building } from '$app/environment';
import { ELITE_API_URL } from '$env/static/private';
import type { components } from './api/api';
import {
	GetAnnouncements,
	GetAuctionHouse,
	GetBazaarData,
	GetEventTeamWords,
	GetLeaderboards,
	GetProducts,
	GetSkyblockItems,
	GetUpcomingEvents,
	GetWeightStyles,
} from './api/elite';
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
		data: {
			list: [] as components['schemas']['WeightStyleWithDataDto'][],
			lookup: {} as Record<string, components['schemas']['WeightStyleWithDataDto']>,
		},
		update: async () => {
			const { data } = await GetWeightStyles();
			return {
				list: data ?? [],
				lookup:
					data?.reduce(
						(acc, style) => {
							acc[style.id] = style;
							return acc;
						},
						{} as Record<string, components['schemas']['WeightStyleWithDataDto']>
					) || {},
			};
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
	bazaar: {
		interval: 180, // 3 minutes
		data: {} as components['schemas']['GetBazaarProductsResponse'],
		update: async () => {
			const { data } = await GetBazaarData();
			return data;
		},
	},
	auctions: {
		interval: 10, // 10 minutes
		data: {} as components['schemas']['AuctionHouseDto'],
		update: async () => {
			const { data } = await GetAuctionHouse();
			return data ?? { items: {} };
		},
	},
	items: {
		data: {} as components['schemas']['GetSkyblockItemsResponse']['items'],
		update: async () => {
			const { data } = await GetSkyblockItems();
			return ((data ?? {}).items ?? {}) as components['schemas']['GetSkyblockItemsResponse']['items'];
		},
	},
	announcements: {
		data: [] as components['schemas']['AnnouncementDto'][],
		update: async () => {
			const { data } = await GetAnnouncements();
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
		return cacheEntries.styles.data.list;
	},
	get styleLookup() {
		return cacheEntries.styles.data.lookup;
	},
	get teamwords() {
		return cacheEntries.teamwords.data;
	},
	get leaderboards() {
		return cacheEntries.leaderboards.data;
	},
	get bazaar() {
		return cacheEntries.bazaar.data;
	},
	get auctions() {
		return cacheEntries.auctions.data;
	},
	get items() {
		return cacheEntries.items.data;
	},
	get announcements() {
		return cacheEntries.announcements.data;
	},
};

let intervals: (number | NodeJS.Timeout)[] = [];

export async function reloadCachedItems() {
	console.log('Fetching new data for cached items...');
	try {
		await Promise.allSettled(Object.values(cacheEntries).map(async (item) => refreshCacheItem(item)));

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

	for (const i of intervals) {
		clearInterval(i);
	}

	intervals = [];

	intervals.push(
		setInterval(
			() => {
				reloadCachedItems();
			},
			1000 * 60 * 60
		)
	); // 1 hour

	for (const entry of Object.values(cacheEntries)) {
		if (!('interval' in entry)) continue;
		intervals.push(setInterval(() => refreshCacheItem(entry), entry.interval * 1000));
	}
}

async function refreshCacheItem(item: (typeof cacheEntries)[keyof typeof cacheEntries]) {
	try {
		const result = await item.update();
		item.data = result ?? item.data;
	} catch (e) {
		console.log(
			'Failed to update cached item ' + Object.entries(cacheEntries).find(([, entry]) => entry === item)?.[0],
			e
		);
	}
}
