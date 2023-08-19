import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GetAccount, GetAdminCropCollectionPoints, GetAdminSkillPoints } from '$lib/api/elite';

export const load = (async ({ params, parent, locals }) => {
	const { user } = await parent();
	const { discord_access_token: token } = locals;

	if (!token || (user.permissions !== 64 && user.permissions !== 17)) {
		throw error(404, 'Not Found');
	}

	const { id, profile } = params;

	const { data: account } = await GetAccount(id).catch(() => ({ data: undefined }));

	if (!account?.id) {
		throw error(404, 'Account not found');
	}

	const selectedProfile =
		account.profiles?.find((p) => p.profileId === profile || p?.profileName === profile) ??
		account.profiles?.find((p) => p.selected) ??
		account.profiles?.[0];

	if (!selectedProfile?.profileId) {
		throw error(404, 'Profile not found');
	}

	const { data: collectionGraph, response } = await GetAdminCropCollectionPoints(
		account.id,
		selectedProfile.profileId,
		token
	).catch(() => ({ data: undefined, response: undefined }));

	if (response && response.status !== 200) {
		console.log(response.statusText);
	}

	const { data: skillGraph } = await GetAdminSkillPoints(account.id, selectedProfile.profileId, token).catch(() => ({
		data: undefined,
	}));

	return {
		account,
		selectedProfile,
		collectionGraph,
		skillGraph,
	};
}) satisfies PageServerLoad;
