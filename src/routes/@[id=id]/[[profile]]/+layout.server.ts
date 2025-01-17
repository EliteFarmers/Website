import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';

export const load = (async ({ parent, setHeaders }) => {
	const { account, profile, session } = await parent();
	const authorized = session?.flags?.support;

	if (!account.id || !account.name || !profile.profileId) {
		throw error(404, 'Player not found');
	}

	if (!authorized) {
		setHeaders({
			'Cache-Control': `public, max-age=${PROFILE_UPDATE_INTERVAL / 1000}`,
		});
	} else {
		setHeaders({
			'Cache-Control': 'no-store',
		});
	}

	return {
		authorized,
	};
}) satisfies LayoutServerLoad;
