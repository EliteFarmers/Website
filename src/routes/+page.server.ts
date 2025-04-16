import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import { GetLeaderboardSlice, GetPublicGuild } from '$lib/api/elite';
import type { PageServerLoad } from './$types';
import { PUBLIC_COMMUNITY_ID } from '$env/static/public';

export const load: PageServerLoad = async ({ setHeaders, locals }) => {
	const { data: eliteGuild } = await GetPublicGuild(PUBLIC_COMMUNITY_ID).catch(() => ({ data: null }));

	const leaderboardInfo = locals.cache?.leaderboards?.leaderboards['farmingweight'];
	const leaderboard = GetLeaderboardSlice('farmingweight', { offset: 0, limit: 10 })
		.then((r) => r.data)
		.catch(() => undefined);

	setHeaders({
		'Cache-Control': `max-age=${LEADERBOARD_UPDATE_INTERVAL / 1000}, public`,
	});

	return {
		lb: leaderboard,
		leaderboard: leaderboardInfo,
		eliteGuild,
	};
};
