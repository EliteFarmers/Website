import { query } from '$app/server';
import {
	getLeaderboard,
	zodGetLeaderboardParams,
	zodGetLeaderboardQueryParams,
	type LeaderboardEntryDto,
	type WeightStyleWithDataDto,
} from '$lib/api';
import { cache } from '$lib/servercache';

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
			entries: leaderboard.entries.map((entry) => {
				if (entry.meta?.leaderboard?.styleId === undefined || entry.meta.leaderboard.styleId === null)
					return entry;
				const style = cache.styleLookup[entry.meta?.leaderboard?.styleId];
				return {
					...entry,
					style: style?.leaderboard ?? undefined,
					imageRefs: style?.imageRefs ?? undefined,
				};
			}) as (LeaderboardEntryDto & {
				style?: WeightStyleWithDataDto['leaderboard'];
				imageRefs?: WeightStyleWithDataDto['imageRefs'];
			})[],
		};
	}
);

export const getLeaderboardList = query(async () => {
	return cache.leaderboards;
});
