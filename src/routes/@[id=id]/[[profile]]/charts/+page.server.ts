import { GetCropCollectionPoints } from '$lib/api/elite';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
	return await parent();
}) satisfies PageServerLoad;

export const actions: Actions = {
	collectiongraph: async ({ request }) => {
		const data = await request.formData();
		const uuid = data.get('uuid') as string | undefined;
		const profile = data.get('profile') as string | undefined;
		const start = data.get('start') as string | undefined;

		if (!uuid || !profile || !start) {
			throw fail(400);
		}

		const { data: collectionGraph, response } = await GetCropCollectionPoints(uuid, profile, start).catch(() => ({
			data: undefined,
			response: undefined,
		}));

		if (response && response.status !== 200) {
			console.log(response.statusText);
		}

		return {
			graph: collectionGraph?.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0)),
		};
	},
};
