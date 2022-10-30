import { fetchPlayer } from '$lib/data';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32) {
		throw error(400, 'Not a valid UUID');
	}

	const player = await fetchPlayer(uuid);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
	if (!player || (player as any).size === 0) {
		throw error(404, "Hypixel API couldn't be reached.");
	}

	return new Response(JSON.stringify(player));
};
