import { GetLeaderboardSlice, SearchPlayers } from '$lib/api/elite';
import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import { json } from '@sveltejs/kit';

let topPlayers: string[] = [];
let topPlayersUpdated = 0;

export async function GET({ url }) {
	const username = url.searchParams.get('q')?.replace(/[^a-zA-Z0-9_]/g, '');

	if (username) {
		const { data: results } = await SearchPlayers(username).catch(() => ({ data: null }));

		return json(results?.slice(0, 9) ?? topPlayers);
	}

	if (topPlayersUpdated < Date.now() - LEADERBOARD_UPDATE_INTERVAL) {
		const { data } = await GetLeaderboardSlice('farmingweight', { offset: 0, limit: 10 }).catch(() => ({
			data: null,
		}));
		const players = (data?.entries ?? []).slice(0, 10).map((entry) => entry.ign ?? '');

		topPlayers = players;
		topPlayersUpdated = Date.now();
	}

	return json(topPlayers);
}
