import { GetCurrentYearContests } from '$lib/api/elite';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const { data, response } = await GetCurrentYearContests(); 

	if (!data) {
		try {
			const errorMsg = await response.text();
			throw error(500, errorMsg);
		} catch (err) {
			throw error(500, 'Failed to load contests');
		}
	}

	return {
		...data
	};
}) satisfies PageServerLoad;
