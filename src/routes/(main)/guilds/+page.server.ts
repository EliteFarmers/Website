import { getHypixelGuilds } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const { data: guilds } = await getHypixelGuilds({
		pageSize: 30,
	});

	return { guilds };
}) satisfies PageServerLoad;
