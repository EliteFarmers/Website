import { json } from '@sveltejs/kit';
import { HYPIXEL_API_KEY } from '$env/static/private'; 

import { fetchPlayer } from '$lib/data';
import type { RequestHandler } from '../$types';

export const GET: RequestHandler = async ({ params }) => {

	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32)
		return new Response(undefined, { status: 400 })

	if (!HYPIXEL_API_KEY) 
		return new Response(undefined, { status: 500 })
	

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const player = await fetchPlayer(uuid, HYPIXEL_API_KEY) as any;

	if (!player || player.size === 0) 
		return new Response(undefined, { status: 404 })

	throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
	// Suggestion (check for correctness before using):
	// return json(player);
	return {
		status: 200,
		body: player
	};
};