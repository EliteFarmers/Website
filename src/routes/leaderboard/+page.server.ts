import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ setHeaders, locals }) => {
	const leaderboards = locals.cache?.leaderboards;

	if (!leaderboards) {
		error(500, 'Leaderboards not available, try again in a moment!');
	}

	setHeaders({
		'Cache-Control': 'max-age=86400, public',
	});

	return {
		leaderboards: leaderboards.categories,
	};
};
