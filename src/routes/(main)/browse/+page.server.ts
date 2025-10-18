import { getPublicGuilds, getUpcomingEvents } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load = (async ({ setHeaders }) => {
	const { data: guilds } = await getPublicGuilds().catch(() => ({ data: undefined }));
	const { data: events } = await getUpcomingEvents().catch(() => ({ data: undefined }));

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
