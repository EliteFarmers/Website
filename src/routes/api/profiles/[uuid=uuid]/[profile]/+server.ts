import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';
import { fetchProfiles } from '$lib/data';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, setHeaders }) => {
	const uuid = params.uuid.replaceAll('-', '');
	const profileId = params.profile;

	const includeInventories = url.searchParams.get('inv') === 'true';

	if (!uuid || uuid.length !== 32 || !profileId) {
		return json({ error: 'Not a valid UUID' }, { status: 400 });
	}

	const profiles = await fetchProfiles(uuid);

	if (!profiles) {
		return json({ success: false, error: "Hypixel API couldn't be reached." }, { status: 404 });
	}

	const profile =
		profileId === 'selected'
			? profiles.profiles.find((profile) => profile.selected)
			: profiles.profiles.find((profile) => profile.profile_id === profileId);

	if (!profile) {
		return json({ success: false, error: 'Profile not found' }, { status: 404 });
	}

	if (!includeInventories) {
		(profile.member as Omit<typeof profile.member, 'inventories'>).inventories = null;
	}

	setHeaders({
		'Cache-Control': `max-age=${PROFILE_UPDATE_INTERVAL / 1000}, public`,
	});

	const data = {
		success: true,
		last_fetched: profiles.last_fetched,
		version: profiles.version,
		profile: profile,
	};

	return json(data);
};
