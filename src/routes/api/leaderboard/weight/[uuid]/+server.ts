import { GetPlayerRank } from '$db/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32 || !/^[0-9a-f]+$/.test(uuid)) {
		return new Response(JSON.stringify({ success: false, error: 'Not a valid uuid.' }), { status: 400 });
	}

	try {
		const rank = await GetPlayerRank(uuid);

		if (rank === -1 || !rank) {
			return new Response(JSON.stringify({ success: false, error: 'Player not found.' }), { status: 404 });
		}

		return new Response(
			JSON.stringify({
				success: true,
				rank: rank,
			})
		);
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: "Couldn't fetch leaderboard" }), { status: 500 });
	}
};
