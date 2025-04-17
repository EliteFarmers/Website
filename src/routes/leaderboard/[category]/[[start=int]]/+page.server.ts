import {
	GetAccount,
	GetLeaderboardSlice,
	GetPlayersRank,
	GetProfilesRank,
	LeaderboardRemovedFilter,
} from '$lib/api/elite';
import { error, fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
export const load = (async ({ params, parent, url }) => {
	const { leaderboard: settings } = await parent();

	if (!settings) {
		throw error(404, 'Leaderboard not found');
	}

	let mode = (url.searchParams.get('mode') ?? '').toLowerCase() as undefined | string;
	if (!['classic', 'ironman', 'island'].includes(mode ?? '')) {
		mode = undefined;
	}

	const interval = url.searchParams.get('interval') ?? undefined;
	if (interval && !interval.match(/^[0-9]{4}-[0-9]{2}$/)) {
		throw error(400, 'Invalid interval provided! Must be yyyy-MM');
	}

	const removed = url.searchParams.get('removed') ?? undefined;
	if (removed && !removed.match(/^[012]$/)) {
		throw error(400, 'Invalid removed value provided! Must be 0, 1 or 2');
	}

	const { category, start } = params;

	let startNum = +(start ?? 0) - 1;
	if (start && isNaN(startNum)) {
		throw error(400, 'Start value must be a number');
	}

	if (startNum < 0) {
		startNum = 0;
	}

	try {
		const { data: lb } = await GetLeaderboardSlice(category, {
			offset: startNum,
			limit: 20,
			mode,
			interval,
			removed: removed ? (+removed as LeaderboardRemovedFilter) : undefined,
		});

		if (!lb) {
			throw error(500, "Leaderboard data couldn't be fetched");
		}

		return {
			lb,
			settings,
			category,
		};
	} catch {
		throw error(500, "Leaderboard data couldn't be fetched. Please try again later.");
	}
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, url, params, locals }) => {
		const { category } = params;
		const formData = await request.formData();
		const search = formData.get('player')?.toString() ?? '';

		const mode = url.searchParams.get('mode')?.toString() ?? undefined;
		const interval = url.searchParams.get('interval')?.toString() ?? undefined;
		const removed = url.searchParams.get('removed')?.toString() ?? undefined;

		if (!search) {
			return fail(400, {
				error: 'Search query is required!',
			});
		}

		const { data: account } = await GetAccount(search);
		if (!account) {
			return fail(400, {
				error: 'User not found!',
			});
		}

		let profiles = account.profiles;
		if (mode) {
			profiles = profiles.filter((p) => (mode === 'classic' && p.gameMode === null) || p.gameMode === mode);
		}

		if (!removed || removed === '0') {
			// Only show active profiles
			profiles = profiles.filter((p) => p.members?.some((m) => m.uuid === account.id && m.active));
		}

		const leaderboard = locals.cache?.leaderboards?.leaderboards?.[category];
		const query = {
			mode,
			interval,
			removed: removed ? (+removed as LeaderboardRemovedFilter) : undefined,
		};

		const results = await Promise.all(
			profiles.map(async (p) => {
				const { data: rank } = leaderboard?.profile
					? await GetProfilesRank(category, p.profileId, false, query)
					: await GetPlayersRank(category, account.id, p.profileId, false, query);

				if (!rank?.rank || rank.rank === -1) {
					return null;
				}

				return rank.rank;
			})
		)
			.then((ranks) => ranks.filter((r) => r !== null))
			.catch(() => []);

		if (results.length === 0) {
			return fail(400, {
				error: 'Player not found in leaderboard!',
			});
		}

		const rank = Math.min(...results);
		if (rank === -1) {
			return fail(400, {
				error: 'Player not found in leaderboard!',
			});
		}

		redirect(303, `/leaderboard/${category}/${Math.max(rank - 10, 1)}${url.search}`);
	},
};
