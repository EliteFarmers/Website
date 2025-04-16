import { GetLeaderboardSlice, LeaderboardRemovedFilter } from '$lib/api/elite';
import { error } from '@sveltejs/kit';

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
