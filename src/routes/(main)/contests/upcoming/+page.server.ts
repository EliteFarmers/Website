import { getCurrentContests } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ setHeaders }) => {
	const { data, response, error: e } = await getCurrentContests();

	if (!data || !response.ok || e) {
		try {
			const errorMsg = e ?? 'Failed to load contests!';
			throw error(500, errorMsg);
		} catch {
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
