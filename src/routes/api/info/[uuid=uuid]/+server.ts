import { GetUser } from '$db/database';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { UserInfo } from '$db/models/users';
import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32) {
		return json({ error: 'Not a valid UUID' }, { status: 400 });
	}

	const user = await GetUser(uuid);

	if (!user) {
		return json({ error: 'User not found' }, { status: 404 });
	}

	if (!user.info) {
		return json({ error: 'User has no info' }, { status: 404 });
	}

	setHeaders({
		'Cache-Control': `max-age=${PROFILE_UPDATE_INTERVAL / 1000}, public`,
	});

	const info = user.info as Partial<UserInfo>;

	return json(info);
};
