import { GetUserByIGN, LinkDiscordUser, UnlinkDiscordUser } from '$db/database';
import { FetchGuilds } from '$lib/discord';
import { IsIGN } from '$params/ign';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

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
};

export const actions: Actions = {
	link: async ({ locals, request }) => {
		if (!locals.discordUser) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const username = data.get('username')?.toString();

		if (!username || !IsIGN(username)) {
			return fail(400, { error: 'Invalid username.' });
		}
	
		const foundUser = await GetUserByIGN(username);
	
		if (!foundUser) {
			return fail(404, { error: 'User not found.' });
		}
	
		const linkedName = foundUser.player?.player.socialMedia?.links?.DISCORD;
	
		if (!linkedName) {
			return fail(400, { error: 'User has no linked account on Hypixel.' });
		}
	
		const discordUser = `${locals.discordUser.username}#${locals.discordUser.discriminator}`;
	
		if (discordUser !== linkedName) {
			return fail(400, { error: 'User has a different linked account on Hypixel.' });
		}
	
		// Success!
		await LinkDiscordUser(foundUser.uuid, locals.discordUser);

		return { success: true };
	},
	unlink: async ({ locals }) => {
		if (!locals.discordUser) {
			throw error(401, 'Unauthorized');
		}

		if (!locals.user) {
			return fail(400, { error: 'User not linked.' });
		}

		const uuid = locals.user.uuid;

		if (!uuid) {
			return fail(400, { error: 'Invalid UUID.' });
		}

		await UnlinkDiscordUser(uuid);

		return { success: true };
	}
}