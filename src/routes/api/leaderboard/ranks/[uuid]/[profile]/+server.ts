import { FetchLeaderboardRankings } from '$db/leaderboards';
import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const { uuid, profile } = params;

	// Validate the UUID and profile UUID to be alphanumeric
	if (!uuid || uuid.length !== 32 || !/^[a-zA-Z0-9_]+$/.test(uuid)) {
		return json({ success: false, error: 'Invalid player UUID.' }, { status: 400 });
	}

	if (profile.length !== 32 || !/^[a-zA-Z0-9_]+$/.test(profile)) {
		return json({ success: false, error: 'Invalid profile UUID.' }, { status: 400 });
	}

	setHeaders({
		'Cache-Control': `max-age=${LEADERBOARD_UPDATE_INTERVAL / 1000}, public`,
	});

	// Get the player's rank in each leaderboard
	try {
		const rankings = await FetchLeaderboardRankings(uuid, profile);

		return json({ success: true, ranks: rankings });
	} catch (error) {
		return json({ success: false, error: 'Error while fetching ranks.' }, { status: 500 });
	}
};
