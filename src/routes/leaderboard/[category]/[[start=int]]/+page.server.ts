import { GetCollectionLeaderboardSlice, GetLeaderboardSlice, GetSkillLeaderboardSlice } from '$lib/api/elite';
import { error } from '@sveltejs/kit';
import { LeaderboardType } from '$lib/constants/leaderboards';

import type { PageServerLoad } from './$types';
export const load = (async ({ params, parent }) => {
	const { leaderboard: settings } = await parent();

	if (!settings) {
		throw error(404, 'Leaderboard not found');
	}

	const { category, start } = params;

	let startNum = +(start ?? 0) - 1;
	if (start && isNaN(startNum)) {
		throw error(400, 'Start value must be a number');
	}

	if (startNum < 0) {
		startNum = 0;
	}

	if (startNum > settings.limit - 20) {
		startNum = settings.limit - 20;
	}

	const type = settings.type;

	const { data: lb } =
		type === LeaderboardType.Skill
			? await GetSkillLeaderboardSlice(category, startNum, 20)
			: type === LeaderboardType.Collection
			? await GetCollectionLeaderboardSlice(category, startNum, 20)
			: await GetLeaderboardSlice(category, startNum, 20);

	if (!lb) {
		throw error(500, "Leaderboard data couldn't be fetched");
	}

	return {
		lb,
		formatting: type === LeaderboardType.Skill ? 'decimal' : ('number' as 'decimal' | 'number'),
	};
}) satisfies PageServerLoad;
