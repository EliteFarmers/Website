import { GetLeaderboardSlice } from '$db/leaderboards';
import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const lb = await GetLeaderboardSlice(0, 10, 'weight', 'farming');

	setHeaders({
		'Cache-Control': `max-age=${LEADERBOARD_UPDATE_INTERVAL / 1000}, public`,
	});

	return {
		lb,
	};
};
