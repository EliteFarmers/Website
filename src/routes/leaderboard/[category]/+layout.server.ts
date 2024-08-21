import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import { LEADERBOARDS, type LeaderboardConfig } from '$lib/constants/leaderboards';

import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = ({ params, depends, setHeaders }) => {
	const { category } = params;

	depends('custom:leaderboard');

	const leaderboard = LEADERBOARDS[category] as LeaderboardConfig | undefined;

	setHeaders({
		'Cache-Control': `max-age=${LEADERBOARD_UPDATE_INTERVAL / 1000}, public`,
	});

	return {
		leaderboard,
	};
};
