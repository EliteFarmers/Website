import { HYPIXEL_API_KEY } from '$env/static/private'; 
import { fetchPlayer } from '$lib/data';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {

	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32) {
		throw error(400, 'Not a valid UUID');
	}

	if (!HYPIXEL_API_KEY) {
		return new Response(undefined, { status: 500 })
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const player = await fetchPlayer(uuid, HYPIXEL_API_KEY) as any;

	if (!player || player.size === 0) {
		throw error(404, 'Hypixel API couldn\'t be reached.');
	}

	return new Response(JSON.stringify(player));
};