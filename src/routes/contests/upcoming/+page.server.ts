import { GetCurrentYearContests } from '$lib/api/elite';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ setHeaders }) => {
	const { data, response } = await GetCurrentYearContests();

	if (!data) {
		try {
			const errorMsg = await response.text();
			throw error(500, errorMsg);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (_) {
			throw error(500, 'Failed to load contests');
		}
	}

	setHeaders({
		'Cache-Control': 'public, max-age=300',
	});

	return {
		...data,
	};
}) satisfies PageServerLoad;
