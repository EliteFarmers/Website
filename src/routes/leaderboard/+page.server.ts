import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const leaderboards = locals.cache?.leaderboards;

	if (!leaderboards) {
		error(500, 'Leaderboards not available, try again in a moment!');
	}

	return {
		leaderboards: leaderboards.categories,
	};
};
