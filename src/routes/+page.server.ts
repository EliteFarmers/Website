import { PUBLIC_COMMUNITY_ID } from '$env/static/public';
import { getPublicGuild } from '$lib/api';
import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import { getLeaderboardSlice } from '$lib/remote/leaderboards.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders, locals }) => {
	const { data: eliteGuild } = await getPublicGuild(PUBLIC_COMMUNITY_ID).catch(() => ({ data: null }));

	const leaderboardInfo = locals.cache?.leaderboards?.leaderboards?.['farmingweight'];
	if (!leaderboardInfo) {
		return {
			lb: undefined,
			leaderboard: undefined,
			eliteGuild,
		};
	}

	const leaderboard = getLeaderboardSlice({ leaderboard: 'farmingweight', offset: 0, limit: 10 });

	setHeaders({
		'Cache-Control': `max-age=${LEADERBOARD_UPDATE_INTERVAL / 1000}, public`,
	});

	return {
		lb: leaderboard,
		leaderboard: leaderboardInfo,
		eliteGuild,
	};
};
