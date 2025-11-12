import { getAccount, getAdminCropGraphs, getCropGraphs, type MinecraftAccountDto } from '$lib/api';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad, PageServerParentData } from './$types';

export const load = (async ({ params, parent, locals }) => {
	const { session, account: aData } = (await parent()) as PageServerParentData & {
		account?: MinecraftAccountDto;
	};
	const { access_token: token } = locals;
	const { id, profile } = params;
	let account = aData;

	if (!token || !session?.perms?.support) {
		throw error(404, 'Not Found');
	}

	if (!account?.id) {
		const { data: accountData } = await getAccount(id).catch(() => ({ data: undefined }));
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

	const { data: collectionGraph, response } = await getCropGraphs(account.id, selectedProfile.profileId, {
		days: 14,
		perDay: 4,
	}).catch(() => ({ data: undefined, response: undefined }));

	if (response && !response.ok) {
		console.log(response.statusText);
	}

	// const { data: skillGraph } = await GetAdminSkillPoints(account.id, selectedProfile.profileId, token).catch(() => ({
	// 	data: undefined,
	// }));

	return {
		account,
		selectedProfile,
		collectionGraph,
		// skillGraph,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	collectiongraph: async ({ request, locals }) => {
		const { access_token: token, session } = locals;

		if (!token || !session?.perms?.support) {
			return fail(403);
		}

		const data = await request.formData();
		const uuid = data.get('uuid') as string | undefined;
		const profile = data.get('profile') as string | undefined;
		const start = data.get('start') as string | undefined;
		const days = data.get('days') as string | undefined;

		const showAll = data.get('all') === 'true';

		if (!uuid || !profile || !start || !days) {
			return fail(400);
		}

		if (!showAll) {
			const { data: collectionGraph, response } = await getCropGraphs(uuid, profile, {
				from: BigInt(start),
				days: +days,
			}).catch(() => ({ data: undefined, response: undefined }));

			if (response && !response.ok) {
				console.log(response.statusText);
			}

			return {
				graph: collectionGraph,
			};
		}

		const { data: collectionGraph, response } = await getAdminCropGraphs(uuid, profile, {
			from: BigInt(start),
			days: +days,
		}).catch(() => ({ data: undefined, response: undefined }));

		if (response && !response.ok) {
			console.log(response.statusText);
		}

		return {
			graph: collectionGraph,
		};
	},
};
