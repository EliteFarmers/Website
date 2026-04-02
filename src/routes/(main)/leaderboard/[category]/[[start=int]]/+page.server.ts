import { getAccount, getPlayerRank2, getProfileRank2, RemovedFilter } from '$lib/api';
import { getLeaderboardSlice } from '$lib/remote/leaderboards.remote';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, parent, url, locals }) => {
	const { leaderboard: settings } = await parent();

	if (!settings) {
		throw error(404, 'Leaderboard not found');
	}

	let mode = (url.searchParams.get('mode') ?? '').toLowerCase() as undefined | string;
	if (!['classic', 'ironman', 'island'].includes(mode ?? '')) {
		mode = undefined;
	}

	const interval = url.searchParams.get('interval') ?? undefined;
	if (interval && !interval.match(/^[0-9]{4}-W?[0-9]{2}$/)) {
		throw error(400, 'Invalid interval provided! Must be yyyy-MM or yyyy-Www');
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
		const params = {
			leaderboard: category,
			offset: startNum,
			limit: 20,
			mode,
			interval,
			removed: removed ? (+removed as 0) : undefined,
		};

		if (locals.bot) {
			const lb = await getLeaderboardSlice(params);

			if (!lb) {
				throw error(500, "Leaderboard data couldn't be fetched");
			}

			return {
				lb,
				settings,
				category,
			};
		}

		return {
			params,
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

		const { data: account } = await getAccount(search).catch(() => ({
			data: undefined,
		}));
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
			removed: removed ? (+removed as RemovedFilter) : undefined,
		};

		const results = await Promise.all(
			profiles.map(async (p) => {
				const { data: rank } = leaderboard?.profile
					? await getProfileRank2(category, p.profileId, query)
					: await getPlayerRank2(category, account.id, p.profileId, query);

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
