import { GetCropCollectionPoints } from '$lib/api/elite';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { preprocessCropCharts, preprocessWeightChart } from '$lib/utils';

export const load = (async ({ parent }) => {
	const { account, profile } = await parent();

	if (!account.id || !account.name || !profile.profileId) {
		error(404, 'Player not found');
	}

	const { data: crops } = await GetCropCollectionPoints(account.id, profile.profileId).catch(() => ({
		data: undefined,
	}));

	return {
		weight: preprocessWeightChart(crops ?? []),
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

		try {
			const {
				data: collectionGraph,
				error: e,
				response,
			} = await GetCropCollectionPoints(uuid, profile, start, daysNum);

			if (!response?.ok || e) {
				return fail(response?.status ?? 500, { error: e ?? 'Failed to fetch data.' });
			}

			return {
				weight: preprocessWeightChart(collectionGraph ?? []),
				graph: preprocessCropCharts(collectionGraph ?? []),
			};
		} catch (e) {
			console.error(e);
			return fail(500);
		}
	},
};
