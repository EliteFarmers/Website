import { GetContests } from '$lib/eliteapi/eliteapi';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { timestamp } = params;

	const { data: contests } = await GetContests(+timestamp);

	if (!contests) {
		throw error(404, 'Contests not found!');
	}

	return {
		contests,
	};
};