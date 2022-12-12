import { GetAccountFromDiscord } from '$db/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params as { id: string };

	if (!id || id.length < 17 || !/^\d+$/.test(id)) {
		return new Response(JSON.stringify({ success: false, error: 'Invalid Discord ID' }), { status: 400 });
	}

	const account = await GetAccountFromDiscord(id);

	if (!account?.success) {
		return new Response(JSON.stringify({ success: false, error: 'Account not found' }), { status: 404 });
	}

	return new Response(JSON.stringify(account));
};
