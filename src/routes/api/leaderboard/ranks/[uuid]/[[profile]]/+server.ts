import { FetchLeaderboardRankings } from '$db/leaderboards';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { uuid, profile } = params;

	// Validate the UUID and profile UUID to be alphanumeric
	if (!uuid || uuid.length !== 32 || !/^[a-zA-Z0-9_]+$/.test(uuid)) {
		return json({ success: false, error: 'Invalid player UUID.' });
	}

	if (profile && (profile.length !== 32 || !/^[a-zA-Z0-9_]+$/.test(profile))) {
		return json({ success: false, error: 'Invalid profile UUID.' });
	}

	// Get the player's rank in each leaderboard
	try {
		const rankings = await FetchLeaderboardRankings(uuid, profile);

		return json({ success: true, ranks: rankings });
	} catch (error) {
		return json({ success: false, error: 'Error while fetching ranks.' });
	}
};
	