import { getAuctionItem, getItemEndedAuctions } from '$lib/remote/auctions.remote';
import { getBazaarItem } from '$lib/remote/bazaar.remote';
import { getItem, getItemRelated } from '$lib/remote/items.remote';
import { cache } from '$lib/servercache';
import type { PageServerLoad } from './$types';

async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
	try {
		return await fn();
	} catch {
		return null;
	}
}

function resolveCacheKey<T>(record: Record<string, T> | undefined, rawId: string): string {
	if (!record) return rawId;
	if (rawId in record) return rawId;

	const upperId = rawId.toUpperCase();
	if (upperId in record) return upperId;

	return rawId;
}

export const load = (async ({ params, url }) => {
	const routeItemId = params.itemid;
	const itemId = resolveCacheKey(cache.items, routeItemId);
	const bazaarItemId = resolveCacheKey(cache.bazaar?.products, routeItemId);
	const auctionItemId = resolveCacheKey(cache.auctions?.items, routeItemId);

	const hasBazaarEntry = Boolean(cache.bazaar?.products?.[bazaarItemId]);
	const hasAuctionEntry = Boolean(cache.auctions?.items?.[auctionItemId]?.length);

	return {
		itemId,
		initialVariant: url.searchParams.get('variant') ?? undefined,
		item: getItem(itemId),
		related: getItemRelated(itemId),
		bazaarData: hasBazaarEntry ? safeFetch(() => getBazaarItem(bazaarItemId)) : null,
		auctionData: hasAuctionEntry ? safeFetch(() => getAuctionItem(auctionItemId)) : null,
		endedAuctions: hasAuctionEntry ? safeFetch(() => getItemEndedAuctions(auctionItemId)) : null,
	};
}) satisfies PageServerLoad;
