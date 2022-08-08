import { HYPIXEL_API_KEY } from '$env/static/private'; 

import { fetchPlayer } from '$lib/data';
import type { RequestHandler } from './__types/[uuid]';

export const GET: RequestHandler = async ({ params }) => {

	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32)
		return {
			status: 400,
			error: {
				message: 'Invalid UUID'
			}
		}

	if (!HYPIXEL_API_KEY) 
		return {
			status: 500,
			error: {
				message: 'No API key was provided. Contact the server administrator.'
			}
		}
	

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const player = await fetchPlayer(uuid, HYPIXEL_API_KEY) as any;

	if (!player || player.size === 0) 
		return { 
			status: 404,
			error: {
				message: `A user with the 'UUID' of ${uuid} was not found!`
			}
		}

	return {
		status: 200,
		body: player
	};
};