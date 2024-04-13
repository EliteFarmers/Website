import { GetCropCollectionPoints } from '$lib/api/elite';
import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ parent, setHeaders }) => {
    const { account, profile } = await parent();

    if (!account?.id || !profile?.profileId) {
        return {
            crops: [],
            xp: []
        }
    }

    const { data: collections, response } = await GetCropCollectionPoints(account.id, profile.profileId)
        .catch(() => ({ data: undefined, response: undefined }));

    setHeaders({
        'Cache-Control': response?.headers.get('cache-control') ?? `public, max-age=${PROFILE_UPDATE_INTERVAL / 1000}`,
    });

    return {
        crops: collections
    };
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

		const { data: collectionGraph, response } = await GetCropCollectionPoints(
			uuid,
			profile,
			start,
		).catch(() => ({ data: undefined, response: undefined }));

		if (response && response.status !== 200) {
			console.log(response.statusText);
		}

		return {
			graph: collectionGraph,
		};
	},
};
