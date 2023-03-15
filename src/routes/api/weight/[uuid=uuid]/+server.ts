import { GetUser } from '$db/database';
import type { UserInfo } from '$db/models/users';
import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';
import { accountFromUUID, fetchProfiles } from '$lib/data';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32) {
		return json({ error: 'Not a valid UUID' }, { status: 400 });
	}

	let user = await GetUser(uuid);

	if (!user) {
		// Create a new user
		const account = await accountFromUUID(uuid);

		if (!account) {
			return json({ error: 'Account not found' }, { status: 404 });
		}

		await fetchProfiles(uuid);
		user = await GetUser(uuid);

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}
	}

	const info = user.info as Partial<UserInfo> | undefined;

	if (!info) {
		return json({ error: 'User info not found' }, { status: 404 });
	}

	setHeaders({
		'Cache-Control': `max-age=${PROFILE_UPDATE_INTERVAL / 1000}, public`,
	});

	return json(info);
};
