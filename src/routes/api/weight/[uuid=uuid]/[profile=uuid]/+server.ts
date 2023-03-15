import { GetUser } from '$db/database';
import type { UserInfo } from '$db/models/users';
import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';
import { accountFromUUID, fetchProfiles } from '$lib/data';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32) {
		return json({ success: false, error: 'Not a valid UUID' }, { status: 400 });
	}

	let user = await GetUser(uuid);

	if (!user) {
		// Create a new user
		const account = await accountFromUUID(uuid);

		if (!account) {
			return json({ success: false, error: 'Account not found' }, { status: 404 });
		}

		await fetchProfiles(uuid);
		user = await GetUser(uuid);

		if (!user) {
			return json({ success: false, error: 'User not found' }, { status: 404 });
		}
	}

	const profilesData = await fetchProfiles(uuid);

	if (!profilesData?.success) {
		return json({ success: false, error: 'Profiles not found' }, { status: 404 });
	}

	const info = user.info as Partial<UserInfo> | undefined;

	if (!info) {
		return json({ success: false, error: 'User info not found' }, { status: 404 });
	}

	const profile = info.profiles?.[params.profile];

	if (!profile) {
		return json({ success: false, error: 'Profile not found' }, { status: 404 });
	}

	setHeaders({
		'Cache-Control': `max-age=${PROFILE_UPDATE_INTERVAL / 1000}, public`,
	});

	return json(profile);
};
