import { getCropGraphs } from '$lib/api';
import { preprocessCropCharts, preprocessWeightChart } from '$lib/utils';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
	const { account, profile } = await parent();

	const { data: crops } = await getCropGraphs(account.id, profile.profileId).catch(() => ({
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
			} = await getCropGraphs(uuid, profile, { from: BigInt(start), days: daysNum });

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
