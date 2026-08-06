import {
	getCategories,
	getLeaderboards,
	getProducts,
	getPublicGuilds,
	getWebsiteSitemapContent,
	getWebsiteSitemapProfiles,
	type WebsiteSitemapContentResponse,
} from '$lib/api';
import { fetchArticlesPaginated } from '$lib/api/cms';
import { parseLeaderboards } from '$lib/constants/leaderboards';
import { listStreamers } from '$lib/stream-api';
import { SIDEBAR_NAV } from '$content/sidebar';
import { env } from '$env/dynamic/public';
import { Readable } from 'node:stream';
import { ErrorLevel, SitemapIndexStream, SitemapStream, streamToPromise, type SitemapItemLoose } from 'sitemap';

const SNAPSHOT_MAX_AGE = 6 * 60 * 60 * 1000;
const PROFILE_PAGE_SIZE = 10_000;
const PROFILE_SHARD_SIZE = 40_000;

const STATIC_ROUTES = [
	...SIDEBAR_NAV.map((item) => item.href),
	'/contests/upcoming',
	'/fortune',
	'/guides/rules',
	'/harvest-feast/upcoming',
	'/pest-farming',
	'/shop',
	'/recap',
	'/contact',
	'/apiterms',
	'/privacy',
	'/terms',
	'/info',
	'/info/account',
	'/info/weight',
	'/info/servers',
	'/info/guides',
	'/info/badges',
	'/info/credits',
	'/info/recap',
] as const;

export const SITEMAP_HEADERS = {
	'Cache-Control': 'public, max-age=300',
	'Cloudflare-CDN-Cache-Control': 'public, max-age=21600, stale-while-revalidate=86400, stale-if-error=86400',
	'Content-Type': 'application/xml; charset=utf-8',
} as const;

export type SitemapSnapshot = {
	index: Uint8Array<ArrayBuffer>;
	documents: ReadonlyMap<string, Uint8Array<ArrayBuffer>>;
};

let snapshot: SitemapSnapshot | null = null;
let snapshotExpiresAt = 0;
let refreshInFlight: Promise<SitemapSnapshot> | null = null;

export async function getSitemapSnapshot(): Promise<SitemapSnapshot | null> {
	if (snapshot && Date.now() < snapshotExpiresAt) {
		return snapshot;
	}

	if (!refreshInFlight) {
		refreshInFlight = buildSnapshot()
			.then((nextSnapshot) => {
				snapshot = nextSnapshot;
				snapshotExpiresAt = Date.now() + SNAPSHOT_MAX_AGE;
				return nextSnapshot;
			})
			.finally(() => {
				refreshInFlight = null;
			});
	}

	try {
		return await refreshInFlight;
	} catch (error) {
		console.error('Failed to generate sitemap snapshot:', error);
		return null;
	}
}

async function buildSnapshot(): Promise<SitemapSnapshot> {
	const hostname = getCanonicalHostname();
	const documents = new Map<string, Uint8Array<ArrayBuffer>>();

	const [articles, content, directories, profileDocuments] = await Promise.all([
		getArticleItems(),
		getContent(),
		getDirectoryItems(),
		getProfileDocuments(hostname),
	]);

	documents.set(
		'static.xml',
		await renderSitemap(
			hostname,
			STATIC_ROUTES.map((url) => ({ url }))
		)
	);
	documents.set('articles.xml', await renderSitemap(hostname, articles));
	documents.set(
		'guides.xml',
		await renderSitemap(
			hostname,
			content.guides.map((guide) => ({
				url: `/guides/${encodeURIComponent(guide.slug)}`,
				lastmod: toLastModified(guide.lastModified),
			}))
		)
	);
	documents.set(
		'events.xml',
		await renderSitemap(
			hostname,
			content.events.map((event) => ({
				url: `/event/${encodeURIComponent(event.name.replaceAll(' ', '-'))}-${event.id.toString()}`,
			}))
		)
	);
	documents.set('contests.xml', await renderSitemap(hostname, getContestItems(content)));
	documents.set('directories.xml', await renderSitemap(hostname, directories));

	for (const [name, document] of profileDocuments) {
		documents.set(name, document);
	}

	const indexItems = [...documents.keys()].map((name) => ({
		url: new URL(`/sitemaps/${name}`, hostname).toString(),
	}));
	const index = await renderSitemapIndex(indexItems);

	return {
		index,
		documents,
	};
}

async function getArticleItems(): Promise<SitemapItemLoose[]> {
	const items: SitemapItemLoose[] = [];
	let page = 1;
	let pageCount = 1;

	do {
		const response = await fetchArticlesPaginated(page, 100);
		if (!response) {
			throw new Error(`Failed to fetch sitemap articles page ${page}`);
		}

		for (const article of response.data) {
			if (!article.slug) continue;
			items.push({
				url: `/articles/${encodeURIComponent(article.slug)}`,
				lastmod: toLastModified(article.lastUpdated) ?? toLastModified(article.releasedAt),
			});
		}

		pageCount = response.meta.pagination.pageCount;
		page += 1;
	} while (page <= pageCount);

	return items;
}

async function getContent(): Promise<WebsiteSitemapContentResponse> {
	const result = await getWebsiteSitemapContent();
	if (!result.ok) {
		throw new Error(`Failed to fetch sitemap content: ${result.response.status}`);
	}
	return result.data;
}

function getContestItems(content: WebsiteSitemapContentResponse): SitemapItemLoose[] {
	return content.contestYears.flatMap((contestYear) => [
		{ url: `/contests/${contestYear.year}/records` },
		...contestYear.months.map((month) => ({ url: `/contests/${contestYear.year}/${month}` })),
	]);
}

async function getDirectoryItems(): Promise<SitemapItemLoose[]> {
	const [guildsResult, leaderboardsResult, streamersResult, categoriesResult, productsResult] = await Promise.all([
		getPublicGuilds(),
		getLeaderboards(),
		listStreamers(),
		getCategories({ includeProducts: true }),
		getProducts(),
	]);

	if (!guildsResult.ok) throw new Error(`Failed to fetch public servers: ${guildsResult.response.status}`);
	if (!leaderboardsResult.ok)
		throw new Error(`Failed to fetch leaderboard directory: ${leaderboardsResult.response.status}`);
	if (!streamersResult.ok) throw new Error(`Failed to fetch streamer directory: ${streamersResult.response.status}`);
	if (!categoriesResult.ok) throw new Error(`Failed to fetch shop categories: ${categoriesResult.response.status}`);
	if (!productsResult.ok) throw new Error(`Failed to fetch shop products: ${productsResult.response.status}`);

	const leaderboards = parseLeaderboards(leaderboardsResult.data).leaderboards;
	const items: SitemapItemLoose[] = [
		...guildsResult.data.map((guild) => ({ url: `/server/${getServerSlug(guild.name)}-${guild.id}` })),
		...Object.keys(leaderboards).map((id) => ({ url: `/leaderboard/${encodeURIComponent(id)}` })),
		...(streamersResult.data.streamers ?? []).flatMap((entry) =>
			entry.streamer?.twitchLogin ? [{ url: `/streamers/${encodeURIComponent(entry.streamer.twitchLogin)}` }] : []
		),
		...categoriesResult.data
			.filter((category) => category.published)
			.map((category) => ({ url: `/shop/category/${encodeURIComponent(category.slug)}` })),
		...productsResult.data
			.filter((product) => product.available && /^\d+$/.test(product.id))
			.map((product) => ({ url: `/shop/${product.id}` })),
	];

	return deduplicate(items);
}

async function getProfileDocuments(hostname: string): Promise<Map<string, Uint8Array<ArrayBuffer>>> {
	const documents = new Map<string, Uint8Array<ArrayBuffer>>();
	let cursor: string | null = null;
	let shardItems: SitemapItemLoose[] = [];
	let shardIndex = 0;
	const seenCursors = new Set<string>();

	while (true) {
		const result = await getWebsiteSitemapProfiles({ cursor: cursor ?? undefined, pageSize: PROFILE_PAGE_SIZE });
		if (!result.ok) {
			throw new Error(`Failed to fetch sitemap profiles: ${result.response.status}`);
		}

		for (const profile of result.data.items) {
			shardItems.push({
				url: `/@${profile.ign}/${encodeURIComponent(profile.profileName)}`,
				lastmod: toLastModified(profile.lastModified),
			});

			if (shardItems.length === PROFILE_SHARD_SIZE) {
				documents.set(getProfileShardName(shardIndex), await renderSitemap(hostname, shardItems));
				shardIndex += 1;
				shardItems = [];
			}
		}

		const nextCursor = result.data.nextCursor;
		if (!nextCursor) break;
		if (result.data.items.length === 0) {
			throw new Error(`Sitemap profile page returned an empty page with cursor ${nextCursor}`);
		}
		if ((cursor && nextCursor <= cursor) || seenCursors.has(nextCursor)) {
			throw new Error(`Sitemap profile cursor did not advance: ${nextCursor}`);
		}
		seenCursors.add(nextCursor);
		cursor = nextCursor;
	}

	if (shardItems.length > 0) {
		documents.set(getProfileShardName(shardIndex), await renderSitemap(hostname, shardItems));
	}

	return documents;
}

function getProfileShardName(index: number) {
	return `profiles/${index.toString().padStart(3, '0')}.xml`;
}

function getServerSlug(name: string) {
	return name
		.replace(/[^a-zA-Z0-9 -]/g, '')
		.replaceAll(' ', '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function getCanonicalHostname() {
	if (!env.PUBLIC_CANONICAL_URL) {
		throw new Error('PUBLIC_CANONICAL_URL is required to generate sitemaps');
	}

	const url = new URL(env.PUBLIC_CANONICAL_URL);
	if (!['http:', 'https:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash) {
		throw new Error('PUBLIC_CANONICAL_URL must be an HTTP(S) origin without a path, query, or hash');
	}

	return url.origin;
}

function toLastModified(value: string | null | undefined) {
	if (!value) return undefined;
	const timestamp = Date.parse(value);
	return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toISOString();
}

function deduplicate(items: SitemapItemLoose[]) {
	const seen = new Set<string>();
	return items.filter((item) => {
		if (seen.has(item.url)) return false;
		seen.add(item.url);
		return true;
	});
}

async function renderSitemap(hostname: string, items: SitemapItemLoose[]) {
	const sitemap = new SitemapStream({ hostname, level: ErrorLevel.THROW });
	const buffer = await streamToPromise(Readable.from(deduplicate(items)).pipe(sitemap));
	return Uint8Array.from(buffer);
}

async function renderSitemapIndex(items: Array<{ url: string }>) {
	const sitemapIndex = new SitemapIndexStream({ level: ErrorLevel.THROW });
	const buffer = await streamToPromise(Readable.from(items).pipe(sitemapIndex));
	return Uint8Array.from(buffer);
}
