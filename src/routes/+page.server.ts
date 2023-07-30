import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import { GetLeaderboardSlice, GetPublicGuild } from '$lib/api/elite';
import type { PageServerLoad } from './$types';
import { PUBLIC_COMMUNITY_ID } from '$env/static/public';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const { data } = await GetLeaderboardSlice('farmingweight', 0, 10).catch(() => ({ data: null }));
	const { data: eliteGuild } = await GetPublicGuild(PUBLIC_COMMUNITY_ID).catch(() => ({ data: null }));

	setHeaders({
		'Cache-Control': `max-age=${LEADERBOARD_UPDATE_INTERVAL / 1000}, public`,
	});

	return {
		lb: data?.entries ?? [],
		eliteGuild,
	};
};
