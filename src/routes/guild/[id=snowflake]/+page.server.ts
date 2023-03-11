import { GetOrCreateGuild } from '$db/events';
import { CanEditFetchedGuild, FetchGuilds, GuildContainsBot } from '$lib/discord';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, cookies }) => {
	const { discordUser } = await parent();

	if (!discordUser) {
		throw redirect(302, '/login');
	}

	const token = cookies.get('discord_access_token');

	if (!token) {
		throw redirect(302, '/login');
	}

	const guilds = await FetchGuilds(token);

	if (!guilds) {
		throw redirect(302, '/login');
	}

	return {
		guilds
	}
}

export const actions: Actions = {
	create: async ({ locals, request, params }) => {
		const guildId = params.id;

		if (!locals.discordUser || !guildId || !locals.discord_access_token) {
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

		const guild = await GetOrCreateGuild(guildId);

		if (!guild) {
			return fail(500, { error: 'An error occurred while creating the guild.' });
		}

		const data = await request.formData();
		const name = data.get('name')?.toString();

		return {
			success: true,
		};
	}
};
