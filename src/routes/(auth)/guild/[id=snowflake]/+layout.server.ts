import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { GetGuild } from '$lib/api/elite';

export const load = (async ({ params, parent, locals }) => {
	const { user } = await parent();
	const { access_token: token } = locals;
	const { id } = params;

	if (!user.id || !token) {
		throw error(401, 'Unauthorized');
	}

	const guild = await GetGuild(id, token)
		.then((guild) => guild.data ?? undefined)
		.catch(() => undefined);

	if (!guild?.guild) {
		throw error(404, 'Guild not found');
	}

	return {
		guildId: guild.id,
		guild: guild.guild,
		userPermissions: guild.permissions,
	};
}) satisfies LayoutServerLoad;
