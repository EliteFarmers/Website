import { fetchProfiles } from '$lib/data';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const uuid = params.uuid.replaceAll('-', '');
	const profileId = params.profileId;

	if (!uuid || uuid.length !== 32 || !profileId) {
		return new Response(JSON.stringify({ error: 'Not a valid UUID' }), { status: 400 });
	}

	const profiles = await fetchProfiles(uuid);

	if (!profiles) {
		return new Response(JSON.stringify({ error: "Hypixel API couldn't be reached." }), { status: 404 });
	}

	const profile =
		profileId === 'selected'
			? profiles.profiles.find((profile) => profile.selected)
			: profiles.profiles.find((profile) => profile.profile_id === profileId);

	if (!profile) {
		return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 });
	}

	const data = {
		success: true,
		last_fetched: profiles.last_fetched,
		version: profiles.version,
		profile: profile,
	};

	return new Response(JSON.stringify(data));
};
