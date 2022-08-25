import { GetViewLeaderboard } from '$db/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {

	const amountRaw = url.searchParams.get('amount') ?? 10;

	// Sanitize amountRaw to be a number
	const amount = Number(amountRaw);
	if (isNaN(amount)) {
		return new Response(JSON.stringify({ error: 'Not a valid amount' }), { status: 400 });
	}

	try {
		const data = await GetViewLeaderboard(amount);
		return new Response(JSON.stringify(data));
	} catch (error) {
		return new Response(JSON.stringify({ error: "Couldn't fetch leaderboard" }), { status: 500 });
	}
};