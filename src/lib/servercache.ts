import { building, dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import fs from 'fs/promises';
import {
	getAnnouncement,
	getAuctionHouseProducts,
	getBazaarProducts,
	getHypixelGuilds,
	getLeaderboard,
	getLeaderboards,
	getProducts,
	getPublicGuild,
	getSkyblockItems,
	getStyles,
	getTeamWordList,
	getUpcomingEvents,
	skyblockGemShop,
	SortHypixelGuildsBy,
	type AnnouncementDto,
	type AuctionHouseDto,
	type EventDetailsDto,
	type EventTeamsWordListDto,
	type GetBazaarProductsResponse,
	type GetSkyblockItemsResponse,
	type GuildDetailsDto,
	type HypixelGuildDetailsDto,
	type LeaderboardDto,
	type ProductDto,
	type SkyblockGemShopsResponse,
	type WeightStyleWithDataDto,
} from './api';
import { fetchAllArticleCategories, fetchBusinessInfo } from './api/cms';
import { parseLeaderboards } from './constants/leaderboards';
import { mdToHtml } from './md';
const { ELITE_API_URL } = env;
const { PUBLIC_COMMUNITY_ID } = publicEnv;

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
	homepageLeaderboard: {
		interval: 900, // 15 minutes
		data: null as LeaderboardDto | null,
		update: async () => {
			const { data } = await getLeaderboard('farmingweight', { offset: 0, limit: 10 }).catch(() => ({
				data: null,
			}));
			return data ?? null;
		},
	},
	communityGuild: {
		interval: 900, // 15 minutes
		data: null as GuildDetailsDto | null,
		update: async () => {
			if (!PUBLIC_COMMUNITY_ID) return null;
			const { data } = await getPublicGuild(PUBLIC_COMMUNITY_ID).catch(() => ({ data: null }));
			return data ?? null;
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
		interval: 600, // 10 minutes
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
			const announcements = (data ?? []) as AnnouncementDto[];
			for (const announcement of announcements) {
				if (!announcement.content) continue;
				announcement.content = (await mdToHtml(announcement.content)) ?? announcement.content;
			}
			return announcements;
		},
	},
	gems: {
		data: {} as SkyblockGemShopsResponse,
		update: async () => {
			const { data } = await skyblockGemShop();
			return data;
		},
	},
	businessInfo: {
		data: {} as Awaited<ReturnType<typeof fetchBusinessInfo>>,
		update: async () => {
			return await fetchBusinessInfo();
		},
	},
	categories: {
		data: [] as Awaited<ReturnType<typeof fetchAllArticleCategories>>,
		update: async () => {
			return await fetchAllArticleCategories();
		},
	},
	topguilds: {
		data: { guilds: [], total: 0 } as {
			guilds: HypixelGuildDetailsDto[];
			total: number | null;
		},
		update: async () => {
			const { data } = await getHypixelGuilds({
				sortBy: SortHypixelGuildsBy.skyblockExperienceAverage,
				page: 1,
				pageSize: 10,
			}).catch(() => ({ data: undefined }));
			return { guilds: data?.guilds ?? [], total: data?.totalGuilds ?? null };
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
	get homepageLeaderboard() {
		return cacheEntries.homepageLeaderboard.data;
	},
	get communityGuild() {
		return cacheEntries.communityGuild.data;
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
	get gems() {
		return cacheEntries.gems.data;
	},
	get businessInfo() {
		return cacheEntries.businessInfo.data;
	},
	get categories() {
		return cacheEntries.categories.data;
	},
	get topguilds() {
		return cacheEntries.topguilds.data;
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
		if (dev) {
			// Check if cached json file exists
			const cacheFilePath = `./cache/${Object.entries(cacheEntries).find(([, entry]) => entry === item)?.[0]}.json`;
			try {
				const fileData = await fs.readFile(cacheFilePath, 'utf-8');
				const cached = JSON.parse(fileData);
				const cacheTime = 1000 * 60 * 10;
				if (Date.now() - cached.lastUpdated < cacheTime) {
					item.data = cached.data;
					return;
				}
			} catch {
				// File doesn't exist, proceed to update from API
			}
		}

		const result = await item.update();
		item.data = result ?? item.data;

		if (dev) {
			// Save to cached json file
			const cacheFilePath = `./cache/${Object.entries(cacheEntries).find(([, entry]) => entry === item)?.[0]}.json`;
			await fs.mkdir('./cache', { recursive: true });
			await fs.writeFile(
				cacheFilePath,
				JSON.stringify({
					data: item.data,
					lastUpdated: Date.now(),
				}),
				'utf-8'
			);
		}
	} catch (e) {
		console.log(
			'Failed to update cached item ' + Object.entries(cacheEntries).find(([, entry]) => entry === item)?.[0],
			e
		);
	}
}
