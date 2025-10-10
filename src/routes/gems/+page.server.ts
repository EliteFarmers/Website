import { cache } from '$lib/servercache';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {
		gems: cache.gems,
	};
}) satisfies PageServerLoad;
