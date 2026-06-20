import { getStreamerDirectory } from '$lib/remote/streamers.remote';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {
		directory: await getStreamerDirectory(),
	};
}) satisfies PageServerLoad;
