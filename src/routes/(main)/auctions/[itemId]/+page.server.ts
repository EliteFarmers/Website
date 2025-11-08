import { getAuctionVariants } from '$lib/api';
import { cache } from '$lib/servercache';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const itemId = params.itemId;
	const variants = await getAuctionVariants(itemId);

	const skyblockId = variants.data?.variants[0]?.skyblockId ?? itemId;
	const item = cache.items[skyblockId];

	const itemData = {
		...variants.data,
		item: item,
	};

	return { item: itemData };
}) satisfies PageServerLoad;
