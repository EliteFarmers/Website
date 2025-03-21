import { GetLeaderboardSlice } from '$lib/api/elite';
import { error } from '@sveltejs/kit';
import { LEADERBOARDS, LeaderboardType } from '$lib/constants/leaderboards';

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

	try {
		const { data: lb } = await GetLeaderboardSlice(category, startNum, 20);

		if (!lb) {
			throw error(500, "Leaderboard data couldn't be fetched");
		}

		const lbSettings = LEADERBOARDS[lb.id as keyof typeof LEADERBOARDS];

		if (lbSettings) {
			lb.title = lbSettings.title;
		}

		return {
			lb,
			settings: lbSettings,
			category,
			formatting: (type === LeaderboardType.Skill ? 'decimal' : 'number') as 'decimal' | 'number',
		};
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_) {
		throw error(500, "Leaderboard data couldn't be fetched. Please try again later.");
	}
}) satisfies PageServerLoad;
