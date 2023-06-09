import { GetAccountFromDiscord, GetUserByIGN, LinkDiscordUser, UnlinkDiscordUser } from '$db/database';
// import { FetchGuilds, FetchPremiumStatus } from '$lib/discord';
import { IsIGN } from '$params/ign';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const discordUser = locals.discordUser;
	const token = locals.discord_access_token;

	if (!discordUser?.id || !token) {
		throw redirect(302, '/login?redirect=/profile');
	}

	//const guilds = await FetchGuilds(token);
	//const status = await FetchPremiumStatus(discordUser.id);

	// if (!guilds) {
	// 	throw error(500, 'Failed to fetch guilds.');
	// }

	const account = await GetAccountFromDiscord(discordUser.id);

	return {
		guildsWithBot: [], // guilds.filter((guild) => guild.hasBot),
		guilds: [], // guilds.filter((guild) => !guild.hasBot),
		premium: 'none' as string,
		mcAccount: account?.account ?? null,
	};
};

export const actions: Actions = {
	link: async ({ locals, request }) => {
		if (!locals.discordUser?.id) {
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

		const discordUser = `${locals.discordUser.username}#${locals.discordUser.discriminator ?? '0'}`;

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

		const account = await GetAccountFromDiscord(locals.discordUser.id);

		if (!account?.account.id) {
			return fail(400, { error: 'User not linked.' });
		}

		const uuid = account.account.id;

		await UnlinkDiscordUser(uuid);

		return { success: true };
	},
};
