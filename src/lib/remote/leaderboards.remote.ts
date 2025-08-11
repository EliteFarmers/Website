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
		}).catch(() => ({
			data: null,
		}));

		if (!leaderboard) return undefined;

		return {
			...leaderboard,
			entries: leaderboard.entries.map((entry) => {
				if (entry.meta?.leaderboard?.styleId === undefined || entry.meta.leaderboard.styleId === null)
					return entry;
				return {
					...entry,
					style: cache.styleLookup[entry.meta?.leaderboard?.styleId]?.leaderboard ?? undefined,
				};
			}) as (LeaderboardEntryDto & {
				style?: WeightStyleWithDataDto['leaderboard'];
			})[],
		};
	}
);
