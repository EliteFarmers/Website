import { GetUser } from '$db/database';
import {
	FetchLeaderboardPlayerAtRank,
	FetchLeaderboardRank,
	LeaderboardCategories,
	LEADERBOARDS,
} from '$db/leaderboards';
import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, setHeaders }) => {
	const { category, page, uuid, profile } = params;

	const includeNext = url.searchParams.get('showNext') === 'true';

	if (!LeaderboardCategories.includes(category)) {
		return json({ success: false, error: 'Leaderboard not found' });
	}

	const categoryEntry = LEADERBOARDS[category];
	const pageEntry = categoryEntry?.pages[page];

	if (!pageEntry) {
		return json({ success: false, error: 'Leaderboard not found' });
	}

	setHeaders({
		'Cache-Control': `max-age=${LEADERBOARD_UPDATE_INTERVAL / 1000}, public`,
	});

	if (!profile) {
		// Fetch the rank on all profiles
		const player = await GetUser(uuid);

		if (!player) {
			return json({ success: false, error: 'Player not found' });
		}

		const profileIds = player.skyblock?.profiles.map((p) => p.profile_id) ?? [];

		try {
			const ranks = await Promise.all(
				profileIds.map(async (profileId) => FetchLeaderboardRank(category, page, player.uuid, profileId))
			);

			// create object with profileId as key
			const ranksObj = ranks.reduce<Record<string, number>>((acc, rank, i) => {
				acc[profileIds[i]] = rank;
				return acc;
			}, {});

			console.log(ranksObj);

			return json({ success: true, ranks: ranksObj });
		} catch (error) {
			return json({ success: false, error: 'Error while fetching ranks.' });
		}
	}

	// Get the player's rank in the specified leaderboard
	try {
		const rank = await FetchLeaderboardRank(category, page, uuid, profile);

		if (includeNext) {
			const next = await FetchLeaderboardPlayerAtRank(category, page, rank - 1);

			return json({ success: true, rank, next });
		}

		return json({ success: true, rank });
	} catch (error) {
		return json({ success: false, error: 'Error while fetching rank.' });
	}
};
