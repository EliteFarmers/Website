import { error, type Actions, type NumericRange } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CanManageGuild } from '$lib/utils';
import { GetGuild, SetGuildInvite } from '$lib/api/elite';

export const load: PageServerLoad = async ({ parent }) => {
	const { userPermissions } = await parent();

	const hasPerms = CanManageGuild(userPermissions);

	if (!hasPerms) {
		throw error(403, 'You do not have permission to edit this guild.');
	}

	return {};
};

export const actions: Actions = {
	setInvite: async ({ params, locals, request }) => {
		const guildId = params.id;
		const { discord_access_token: token } = locals;

		if (!locals.user || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const guild = await GetGuild(guildId, token)
			.then((guild) => guild.data ?? undefined)
			.catch(() => undefined);

		if (!guild) throw error(404, 'Guild not found');

		const hasPerms = CanManageGuild(guild.permissions, locals.user);

		if (!hasPerms) throw error(403, 'You do not have permission to edit this guild.');

		if (!guild.guild?.features?.jacobLeaderboardEnabled) {
			throw error(402, 'This guild does not have the Jacob Leaderboard feature enabled.');
		}

		const data = await request.formData();

		const invite = data.get('invite') as string;

		if (!invite) {
			throw error(400, 'Invite is required');
		}

		const { response } = await SetGuildInvite(guildId, token, invite);

		if (response.status !== 200) {
			const msg = await response.text();
			throw error(response.status as NumericRange<400, 499>, msg);
		}

		return {
			success: true,
		};
	},
};
