import { query } from '$app/server';
import { getLeaderboard, zodGetLeaderboardParams, zodGetLeaderboardQueryParams } from '$lib/api';
import { cache } from '$lib/servercache';
import { applyLeaderboardStyles } from '$lib/leaderboards/styles';

/**
 * Get a slice of the leaderboard with loaded leaderboard styles from the cache.
 */
export const getLeaderboardSlice = query(
	zodGetLeaderboardParams.extend(zodGetLeaderboardQueryParams.shape),
	async (params) => {
		const { data: leaderboard } = await getLeaderboard(params.leaderboard, {
			offset: params.offset,
			limit: params.limit,
			mode: params.mode,
			removed: params.removed,
			interval: params.interval,
		}).catch(() => ({
			data: null,
		}));

		if (!leaderboard) return undefined;

		return {
			...leaderboard,
			entries: applyLeaderboardStyles(leaderboard.entries, cache.styleLookup),
		};
	}
);

export const getLeaderboardList = query(async () => {
	return cache.leaderboards;
});
