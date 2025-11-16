import { getHypixelGuild } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const { id } = params;

	const { data: guild } = await getHypixelGuild(id);

	if (!guild) {
		error(404, 'Guild not found');
	}

	return {
		guild,
	};
}) satisfies PageServerLoad;
