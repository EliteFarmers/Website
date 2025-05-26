import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const { item } = params;
	const items = item.split('|');

	const bz = locals.cache?.bazaar.products;
	const result = Object.fromEntries(items.map((id) => [id, bz?.[id]]));

	return json(result);
};
