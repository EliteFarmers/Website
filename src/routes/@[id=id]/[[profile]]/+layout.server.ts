import { GetPlayerRanks } from '$lib/api/elite';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { PermissionFlags, hasPermission } from '$lib/auth';
import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';

export const load = (async ({ parent, locals, setHeaders }) => {
	const { account, profile } = await parent();

	let authorized = false;
	if (locals.access_token && hasPermission(locals.user, PermissionFlags.ViewGraphs)) {
		authorized = true;
	}

	if (!account.id || !account.name || !profile.profileId) {
		throw error(404, 'Player not found');
	}

	const { data: ranks } = await GetPlayerRanks(account.id, profile.profileId);

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
		ranks,
		authorized,
	};
}) satisfies LayoutServerLoad;
