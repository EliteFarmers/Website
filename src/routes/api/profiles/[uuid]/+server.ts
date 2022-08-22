import { HYPIXEL_API_KEY } from '$env/static/private'; 
import { fetchProfiles } from '$lib/data';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {

	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32) {
		return new Response(JSON.stringify({ error: 'Not a valid UUID' }), { status: 400 });
	}

	if (!HYPIXEL_API_KEY) {
		return new Response(JSON.stringify({ error: 'API key not provided' }), { status: 500 });
	}

	const profiles = await fetchProfiles(uuid, HYPIXEL_API_KEY);

	if (!profiles) {
		return new Response(JSON.stringify({ error: 'Hypixel API couldn\'t be reached.' }), { status: 404 });
	}

	return new Response(JSON.stringify(profiles));
};