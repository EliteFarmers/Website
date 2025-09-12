import { getUserGuild } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	const { access_token: token } = locals;
	const { id } = params;

	if (!token) {
		throw error(401, 'Unauthorized');
	}

	const guild = await getUserGuild(id)
		.then((guild) => guild.data ?? undefined)
		.catch(() => undefined);

	if (!guild?.guild) {
		throw error(404, 'Guild not found');
	}

	return {
		guildId: guild.id,
		guild: guild.guild,
		authGuild: guild,
	};
}) satisfies LayoutServerLoad;
