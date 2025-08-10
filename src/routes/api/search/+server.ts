import { searchAccounts } from '$lib/api';
import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import { getLeaderboardSlice } from '$lib/remote/leaderboards.remote.js';
import { json } from '@sveltejs/kit';

let topPlayers: string[] = [];
let topPlayersUpdated = 0;

export async function GET({ url }) {
	const username = url.searchParams.get('q')?.replace(/[^a-zA-Z0-9_]/g, '');

	if (username) {
		const { data: results } = await searchAccounts({ q: username }).catch(() => ({ data: null }));

		return json(results?.slice(0, 9) ?? topPlayers);
	}

	if (topPlayersUpdated < Date.now() - LEADERBOARD_UPDATE_INTERVAL) {
		const data = await getLeaderboardSlice({ leaderboard: 'farmingweight', offset: 0, limit: 10, new: true });
		const players = (data?.entries ?? []).slice(0, 10).map((entry) => entry.ign ?? '');

		topPlayers = players;
		topPlayersUpdated = Date.now();
	}

	return json(topPlayers);
}
