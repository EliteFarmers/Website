import { HYPIXEL_API_KEY } from '$env/static/private'; 

import { fetchProfiles } from '$lib/data';
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
	

	const profiles = await fetchProfiles(uuid, HYPIXEL_API_KEY);

	if (!profiles) 
		return { 
			status: 404,
			error: {
				message: `A user with the 'UUID' of ${uuid} was not found!`
			}
		}

	return {
		status: 200,
		body: profiles
	};
};