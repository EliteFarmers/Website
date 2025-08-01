import type { RatesItemPriceData } from '$lib/api/elite';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const { item } = params;
	if (!item) {
		return json({});
	}
	const items = item.split('|');

	const bz = locals.cache?.bazaar.products;
	const ah = locals.cache?.auctions.items;
	const sbItems = locals.cache?.items;

	const result: RatesItemPriceData = Object.fromEntries(
		items.map((id) => [
			id,
			{
				auctions: ah?.[id],
				bazaar: bz?.[id],
				item: sbItems?.[id] ?? undefined,
			},
		])
	);

	return json(result);
};
