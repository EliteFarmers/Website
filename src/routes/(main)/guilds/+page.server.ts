import { SortHypixelGuildsBy } from '$lib/api';
import { getHypixelGuildsList } from '$lib/remote/guilds.remote';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const guilds = await getHypixelGuildsList({
		sortBy: SortHypixelGuildsBy.memberCount,
		descending: true,
		pageSize: 30,
	});

	return { guilds };
}) satisfies PageServerLoad;
