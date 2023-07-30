import { GetPublicGuilds } from '$lib/api/elite';
import type { PageServerLoad } from './$types';

export const load = (async ({ setHeaders }) => {
	const { data: guilds } = await GetPublicGuilds().catch(() => ({ data: undefined }));

	if (guilds) {
		setHeaders({
			'Cache-Control': 'public, max-age=3600',
		});
	}

	return {
		guilds,
	};
}) satisfies PageServerLoad;
