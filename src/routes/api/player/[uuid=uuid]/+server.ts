import { ACCOUNT_UPDATE_INTERVAL } from '$lib/constants/data';
import { fetchPlayer } from '$lib/data';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32) {
		return json({ success: false, error: 'Not a valid UUID' }, { status: 400 });
	}

	const player = await fetchPlayer(uuid);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
	if (!player || (player as any).size === 0) {
		return json({ success: false, error: "Player not found or Hypixel API couldn't be reached." }, { status: 404 });
	}

	setHeaders({
		'Cache-Control': `max-age=${ACCOUNT_UPDATE_INTERVAL / 1000}, public`,
	});

	return json(player);
};
