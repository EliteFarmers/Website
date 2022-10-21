import { GetWeightLeaderboard } from '$db/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const startRaw = url.searchParams.get('start') ?? 1;

	// Sanitize startRaw to be a number
	const start = Number(startRaw);
	if (isNaN(start) || start > 990 || start < 1) {
		return new Response(JSON.stringify({ error: 'Not a valid start number' }), { status: 400 });
	}

	try {
		const data = await GetWeightLeaderboard(start - 1);
		return new Response(JSON.stringify(data));
	} catch (error) {
		return new Response(JSON.stringify({ error: "Couldn't fetch leaderboard" }), { status: 500 });
	}
};
