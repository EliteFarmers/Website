import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GetItemPrices } from '$lib/api/elite';

export const GET: RequestHandler = async ({ params }) => {
	const { item } = params;
	const items = item.split('|');

	// const bz = locals.cache?.bazaar.products;
	// const ah = locals.cache?.auctions.items;

	// const result = Object.fromEntries(items.map((id) => [id, {
	//     ah: ah?.[id],
	//     bz: bz?.[id]
	// }]));

	const { data: result } = await GetItemPrices(items);
	return json(result);
};
