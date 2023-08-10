import { GetPublicGuilds, GetUpcomingEvents } from '$lib/api/elite';
import type { PageServerLoad } from './$types';

export const load = (async ({ setHeaders }) => {
	const { data: guilds } = await GetPublicGuilds().catch(() => ({ data: undefined }));
	const { data: events } = await GetUpcomingEvents().catch(() => ({ data: undefined }));

	if (guilds && events) {
		setHeaders({
			'Cache-Control': 'public, max-age=3600',
		});
	}

	return {
		guilds,
		events,
	};
}) satisfies PageServerLoad;
