import { GetCropCollectionPoints } from '$lib/api/elite';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { preprocessCropCharts } from '$lib/utils';

export const load = (async ({ parent }) => {
	const { account, profile } = await parent();

	if (!account.id || !account.name || !profile.profileId) {
		error(404, 'Player not found');
	}

	const { data: crops } = await GetCropCollectionPoints(account.id, profile.profileId).catch(() => ({
		data: undefined,
	}));

	return {
		crops: preprocessCropCharts(crops ?? []),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	collectiongraph: async ({ request }) => {
		const data = await request.formData();
		const uuid = data.get('uuid') as string | undefined;
		const profile = data.get('profile') as string | undefined;
		const start = data.get('start') as string | undefined;
		const days = data.get('days') as string | undefined;
		const daysNum = days ? parseInt(days) : undefined;

		if (!uuid || !profile || !start) {
			return fail(400);
		}

		const { data: collectionGraph, response } = await GetCropCollectionPoints(uuid, profile, start, daysNum).catch(
			() => ({
				data: undefined,
				response: undefined,
			})
		);

		if (response && response.status !== 200) {
			console.log(response.statusText);
		}

		return {
			graph: preprocessCropCharts(collectionGraph ?? []),
		};
	},
};
