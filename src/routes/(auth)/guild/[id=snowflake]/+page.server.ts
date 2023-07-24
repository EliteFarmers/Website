// import { GetOrCreateGuild } from '$db/events';
import { CanEditFetchedGuild, GuildContainsBot } from '$lib/discord';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { CanManageGuild } from '$lib/utils';

export const load: PageServerLoad = async ({ parent }) => {
	const { userPermissions } = await parent();

	const hasPerms = CanManageGuild(userPermissions);

	if (!hasPerms) {
		throw error(403, 'You do not have permission to edit this guild.');
	}

	return {};
};

export const actions: Actions = {
	create: async ({ locals, params }) => {
		const guildId = params.id;

		if (!locals.user || !guildId || !locals.discord_access_token) {
			throw error(401, 'Unauthorized');
		}

		const hasPerms = await CanEditFetchedGuild(locals.discord_access_token, guildId);

		if (!hasPerms) {
			return fail(403, { error: 'You do not have permission to edit this guild.' });
		}

		const containsBot = await GuildContainsBot(guildId);

		if (!containsBot) {
			return fail(400, { error: 'This guild does not contain the bot.' });
		}
		/*
		const guild = await GetOrCreateGuild(guildId);

		if (!guild) {
			return fail(500, { error: 'An error occurred while creating the guild.' });
		}

		const data = await request.formData();
		const name = data.get('name')?.toString();
		*/

		return {
			success: true,
		};
	},
};
