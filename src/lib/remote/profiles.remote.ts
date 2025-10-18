import { query } from '$app/server';
import {
	getPlayerLeaderboardRanks,
	getProfile,
	getProfileInventory,
	getSelectedProfile,
	zodGetPlayerLeaderboardRanksParams,
	zodGetProfileInventoryParams,
	zodGetProfileParams,
	zodGetSelectedProfileParams,
} from '$lib/api';

export const getProfileMember = query(zodGetProfileParams, async (params) => {
	return await getProfile(params.playerUuid, params.profileUuid).then((res) => res.data);
});

export const getSelectedMember = query(zodGetSelectedProfileParams, async (params) => {
	return await getSelectedProfile(params.playerUuid).then((res) => res.data);
});

export const getMemberRanks = query(zodGetPlayerLeaderboardRanksParams, async (params) => {
	return await getPlayerLeaderboardRanks(params.playerUuid, params.profileUuid).then((res) => res.data);
});

export const getMemberInventory = query(zodGetProfileInventoryParams, async (params) => {
	return await getProfileInventory(params.playerUuid, params.profileUuid, params.inventory).then((res) => res.data);
});
