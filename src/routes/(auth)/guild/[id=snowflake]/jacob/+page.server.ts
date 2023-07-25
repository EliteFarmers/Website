import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { CanManageGuild } from '$lib/utils';
import { GetGuild } from '$lib/api/elite';

export const load: PageServerLoad = async ({ parent }) => {
	const { userPermissions, guild } = await parent();

	const hasPerms = CanManageGuild(userPermissions);

	if (!hasPerms) {
		throw error(403, 'You do not have permission to edit this guild.');
	}

	if (!guild?.features?.jacobLeaderboardEnabled) {
		throw error(402, 'This guild does not have the Jacob Leaderboard feature enabled.');
	}

	return {
		...guild.features.jacobLeaderboard
	};
};

export const actions: Actions = {
	create: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { discord_access_token: token } = locals;

		if (!locals.user || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}
		
		const guild = await GetGuild(guildId, token).then((guild) => guild.data ?? undefined).catch(() => undefined);
		if (!guild) throw error(404, 'Guild not found');
		
		const hasPerms = CanManageGuild(guild.permissions);
		if (!hasPerms) throw error(403, 'You do not have permission to edit this guild.');
		
		if (!guild.guild?.features?.jacobLeaderboardEnabled) {
			throw error(402, 'This guild does not have the Jacob Leaderboard feature enabled.');
		}
		
		const data = await request.formData();
	

		// Do stuff here

		return {
			success: true,
		};
	},
};
