import { GetCropCollectionPoints } from '$lib/api/elite';
import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';
import type { PageServerLoad } from './$types';

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