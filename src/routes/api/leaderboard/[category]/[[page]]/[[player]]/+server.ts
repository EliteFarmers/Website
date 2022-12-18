import { GetUserByIGN } from '$db/database';
import { FetchLeaderboardRank, GetLeaderboardSlice, LeaderboardCategories, LEADERBOARDS } from '$db/leaderboards';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, params }) => {
	const { category } = params;
	let page = params.page;
	let player = params.player;

	const startRaw = url.searchParams.get('start') ?? 1;
	const limitRaw = url.searchParams.get('limit') ?? 20;
	let ign = url.searchParams.get('jump');

	// Sanitize startRaw to be a number
	let start = Number(startRaw);
	if (isNaN(start) || start > 990 || start < 1) {
		return new Response(JSON.stringify({ error: 'Not a valid start number' }), { status: 400 });
	}

	// Sanitize limitRaw to be a number
	const limit = Number(limitRaw);
	if (isNaN(limit) || limit > 1000 || limit < 1) {
		return new Response(JSON.stringify({ error: 'Not a valid limit number' }), { status: 400 });
	}

	if (!params.player && page && !isNaN(Number(page))) {
		player = page;
		page = 'DEFAULT';
	}

	if (!LeaderboardCategories.includes(category)) {
		throw error(404, 'Leaderboard not found');
	}

	if (ign && ign.length > 0 && ign.length <= 24 && /^[a-zA-Z0-9_]+$/.test(ign)) {
		const player = await GetUserByIGN(ign);

		if (player) {
			ign = player.ign;

			const rank = await FetchLeaderboardRank(player.uuid, category, page);

			if (rank && rank !== -1) {
				start = Math.floor((rank - 1) / 20) * 20 + 1;
			}
		}
	}

	start = Math.max(1, Number(start));

	const lb = await GetLeaderboardSlice(Number(start) - 1, limit, category, page);

	const categoryEntry = LEADERBOARDS[category];
	const pageEntry = categoryEntry?.pages[page ?? 'DEFAULT'];

	const name = pageEntry?.name ?? categoryEntry?.name ?? 'Leaderboard';

	try {
		return new Response(JSON.stringify({ success: true, start: start, name: name, leaderboard: lb }));
	} catch (error) {
		return new Response(JSON.stringify({ error: "Couldn't fetch leaderboard" }), { status: 500 });
	}
};