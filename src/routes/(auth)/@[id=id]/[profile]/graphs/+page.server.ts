import { error } from '@sveltejs/kit';
import type { PageServerLoad, PageServerParentData } from './$types';
import { GetAccount, GetAdminCropCollectionPoints, GetAdminSkillPoints } from '$lib/api/elite';
import type { components } from '$lib/api/api';

export const load = (async ({ params, parent, locals }) => {
	const { user, account: aData } = (await parent()) as PageServerParentData & {
		account?: components['schemas']['MinecraftAccountDto'];
	};
	const { discord_access_token: token } = locals;
	const { id, profile } = params;
	let account = aData;

	if (!token || (user.permissions ?? 0) < 17) {
		throw error(404, 'Not Found');
	}

	if (!account?.id) {
		const { data: accountData } = await GetAccount(id).catch(() => ({ data: undefined }));
		if (!accountData?.id) {
			throw error(404, 'Account not found');
		}
		account = accountData;
	}

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
