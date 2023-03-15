import { GetAccountFromDiscord } from '$db/database';
import { ACCOUNT_UPDATE_INTERVAL } from '$lib/constants/data';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const { id } = params as { id: string };

	if (!id || id.length < 17 || !/^\d+$/.test(id)) {
		return json({ success: false, error: 'Invalid Discord ID' }, { status: 400 });
	}

	const account = await GetAccountFromDiscord(id);

	if (!account?.success) {
		return json({ success: false, error: 'Account not found' }, { status: 404 });
	}

	setHeaders({
		'Cache-Control': `max-age=${ACCOUNT_UPDATE_INTERVAL / 1000}, public`,
	});

	return json(account);
};
