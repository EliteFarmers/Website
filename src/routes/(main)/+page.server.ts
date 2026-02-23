import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const leaderboardInfo = locals.cache?.leaderboards?.leaderboards?.['farmingweight'];

	if (!leaderboardInfo) {
		return {
			lb: undefined,
			leaderboard: undefined,
			eliteGuild: locals.cache?.communityGuild,
		};
	}

	return {
		lb: locals.cache?.homepageLeaderboard ?? undefined,
		leaderboard: leaderboardInfo,
		eliteGuild: locals.cache?.communityGuild,
	};
};
