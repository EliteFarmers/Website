import { getPublicGuilds, getUpcomingEvents } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const { data: guilds } = await getPublicGuilds().catch(() => ({ data: undefined }));
	const { data: events } = await getUpcomingEvents().catch(() => ({ data: undefined }));

	return {
		guilds,
		events,
	};
}) satisfies PageServerLoad;
