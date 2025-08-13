import { building } from '$app/environment';
import { ELITE_API_URL } from '$env/static/private';
import {
	getAnnouncement,
	getAuctionHouseProducts,
	getBazaarProducts,
	getLeaderboards,
	getProducts,
	getSkyblockItems,
	getStyles,
	getTeamWordList,
	getUpcomingEvents,
	type AnnouncementDto,
	type AuctionHouseDto,
	type EventDetailsDto,
	type EventTeamsWordListDto,
	type GetBazaarProductsResponse,
	type GetSkyblockItemsResponse,
	type ProductDto,
	type WeightStyleWithDataDto,
} from './api';
import { parseLeaderboards } from './constants/leaderboards';

const cacheEntries = {
	events: {
		data: [] as EventDetailsDto[],
		update: async () => {
			const { data } = await getUpcomingEvents();
			return data ?? [];
		},
	},
	products: {
		data: [] as ProductDto[],
		update: async () => {
			const { data } = await getProducts();
			return data ?? [];
		},
	},
	styles: {
		data: {
			list: [] as WeightStyleWithDataDto[],
			lookup: {} as Record<string, WeightStyleWithDataDto>,
		},
		update: async () => {
			const { data } = await getStyles();
			return {
				list: data ?? [],
				lookup:
					data?.reduce(
						(acc, style) => {
							acc[style.id] = style;
							return acc;
						},
						{} as Record<string, WeightStyleWithDataDto>
					) || {},
			};
		},
	},
	teamwords: {
		data: {} as EventTeamsWordListDto,
		update: async () => {
			const { data } = await getTeamWordList();
			return data ?? { first: [] as string[], second: [] as string[], third: [] as string[] };
		},
	},
	leaderboards: {
		data: {} as ReturnType<typeof parseLeaderboards>,
		update: async () => {
			const { data } = await getLeaderboards();
			return parseLeaderboards(data);
		},
	},
	bazaar: {
		interval: 180, // 3 minutes
		data: {} as GetBazaarProductsResponse,
		update: async () => {
			const { data } = await getBazaarProducts();
			return data;
		},
	},
	auctions: {
		interval: 10, // 10 minutes
		data: {} as AuctionHouseDto,
		update: async () => {
			const { data } = await getAuctionHouseProducts();
			return data ?? { items: {} };
		},
	},
	items: {
		data: {} as GetSkyblockItemsResponse['items'],
		update: async () => {
			const { data } = await getSkyblockItems();
			return ((data ?? {}).items ?? {}) as GetSkyblockItemsResponse['items'];
		},
	},
	announcements: {
		data: [] as AnnouncementDto[],
		update: async () => {
			const { data } = await getAnnouncement();
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
