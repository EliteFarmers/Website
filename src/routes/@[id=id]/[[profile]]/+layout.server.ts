import { GetCropCollectionPoints, GetPlayerRanks } from '$lib/api/elite';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { PermissionFlags, hasPermission } from '$lib/auth';
import { preprocessCropCharts } from '$lib/utils';

export const load = (async ({ parent, locals }) => {
	const { account, profile } = await parent();

	let authorized = false;
	if (locals.discord_access_token && hasPermission(locals.user, PermissionFlags.ViewGraphs)) {
		authorized = true;
	}

	if (!account.id || !account.name || !profile.profileId) {
		throw error(404, 'Player not found');
	}

	const { data: ranks } = await GetPlayerRanks(account.id, profile.profileId);
	const { data: crops } = await GetCropCollectionPoints(account.id, profile.profileId).catch(() => ({
		data: undefined,
	}));

	return {
		ranks,
		authorized,
		crops: preprocessCropCharts(crops ?? []),
	};
}) satisfies LayoutServerLoad;
