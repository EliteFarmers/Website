import { getAuction } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { data, response } = await getAuction(params.auctionId);
	if (!data?.auction || response.status === 404) {
		throw error(404, 'Auction not found');
	}

	return {
		auction: data.auction,
	};
};
