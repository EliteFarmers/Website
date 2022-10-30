import { fetchProfiles } from '$lib/data';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32) {
		return new Response(JSON.stringify({ error: 'Not a valid UUID' }), { status: 400 });
	}

	const profiles = await fetchProfiles(uuid);

	if (!profiles) {
		return new Response(JSON.stringify({ error: "Hypixel API couldn't be reached." }), { status: 404 });
	}

	return new Response(JSON.stringify(profiles));
};
