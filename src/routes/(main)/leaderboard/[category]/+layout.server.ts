import type { LeaderboardInfo } from '$lib/constants/leaderboards';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ params, depends, locals }) => {
	const { category } = params;

	depends('custom:leaderboard');

	const leaderboard = locals.cache?.leaderboards?.leaderboards?.[category] as LeaderboardInfo | undefined;

	if (!leaderboard) {
		throw error(404, 'Leaderboard not found!');
	}

	return {
		leaderboard,
	};
};
