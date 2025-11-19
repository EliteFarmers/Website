import { getHypixelGuild, type HypixelGuildDto } from '$lib/api';
import { getLeaderboardList } from '$lib/remote/leaderboards.remote';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params }) => {
	const { id } = params;

	const { data } = await getHypixelGuild(id).catch(() => ({ data: undefined }));
	const guild: HypixelGuildDto | undefined = data?.guild;

	if (!guild) {
		error(404, 'Guild not found');
	}

	const leaderboards = await getLeaderboardList();

	return {
		guild,
		leaderboards,
	};
}) satisfies LayoutServerLoad;
