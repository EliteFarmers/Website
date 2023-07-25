import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { CanManageGuild } from '$lib/utils';

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
	create: ({ locals, params }) => {
		const guildId = params.id;

		if (!locals.user || !guildId || !locals.discord_access_token) {
			throw error(401, 'Unauthorized');
		}

		const hasPerms = undefined;//await CanEditFetchedGuild(locals.discord_access_token, guildId);

		if (!hasPerms) {
			return fail(403, { error: 'You do not have permission to edit this guild.' });
		}

		const containsBot = undefined;//await GuildContainsBot(guildId);

		if (!containsBot) {
			return fail(400, { error: 'This guild does not contain the bot.' });
		}

		// Do stuff here

		return {
			success: true,
		};
	},
};
