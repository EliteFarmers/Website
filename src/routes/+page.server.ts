import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import { GetLeaderboardSlice } from '$lib/eliteapi/eliteapi';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const { data } = await GetLeaderboardSlice('farmingweight', 0, 10);

	setHeaders({
		'Cache-Control': `max-age=${LEADERBOARD_UPDATE_INTERVAL / 1000}, public`,
	});

	return {
		lb: data?.entries ?? [],
	};
};
