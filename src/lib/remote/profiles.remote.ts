import { query } from '$app/server';
import { getProfile, getSelectedProfile, zodGetProfileParams, zodGetSelectedProfileParams } from '$lib/api';

export const getProfileMember = query(zodGetProfileParams, async (params) => {
	return await getProfile(params.playerUuid, params.profileUuid);
});

export const getSelectedMember = query(zodGetSelectedProfileParams, async (params) => {
	return await getSelectedProfile(params.playerUuid);
});
