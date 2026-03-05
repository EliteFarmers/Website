import { cache } from '$lib/servercache';
import type { PageServerLoad } from './$types';

export const load = (() => {
	const bazaarCount = Object.keys(cache.bazaar?.products ?? {}).length;
	const auctionCount = Object.keys(cache.auctions?.items ?? {}).length;

	return {
		bazaarCount,
		auctionCount,
	};
}) satisfies PageServerLoad;
