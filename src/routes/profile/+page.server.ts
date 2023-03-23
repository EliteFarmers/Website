import { GetUserByIGN, LinkDiscordUser, UnlinkDiscordUser } from '$db/database';
import { FetchGuilds, FetchPremiumStatus } from '$lib/discord';
import { IsIGN } from '$params/ign';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent, locals }) => {
	const { authModel } = await parent();

	if (!authModel?.id) {
		throw redirect(302, '/login');
	}

	const token = locals.discord_access_token;

	if (!token) {
		throw redirect(302, '/login');
	}

	const guilds = await FetchGuilds(token);
	const status = await FetchPremiumStatus(authModel.discordId);

	if (!guilds) {
		throw redirect(302, '/login');
	}

	return {
		guildsWithBot: guilds.filter((guild) => guild.hasBot),
		guilds: guilds.filter((guild) => !guild.hasBot),
		premium: status as string,
	};
};

export const actions: Actions = {
	link: async ({ locals, request }) => {
		if (!locals.userRecord?.id || !locals.discordUser) {
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

		const discordUser = `${locals.userRecord.username}#${locals.userRecord.discriminator}`;

		if (discordUser !== linkedName) {
			return fail(400, { error: 'User has a different linked account on Hypixel.' });
		}

		// Success!
		await LinkDiscordUser(foundUser.uuid, locals.discordUser);

		await locals.pb.collection('users').update(locals.userRecord.id, {
			uuid: foundUser.uuid,
			ign: foundUser.ign,
		});

		return { success: true };
	},
	unlink: async ({ locals }) => {
		if (!locals.discordUser) {
			throw error(401, 'Unauthorized');
		}

		if (!locals.userRecord?.uuid) {
			return fail(400, { error: 'User not linked.' });
		}

		const uuid = locals.userRecord.uuid;

		if (!uuid) {
			return fail(400, { error: 'Invalid UUID.' });
		}

		await UnlinkDiscordUser(uuid);

		await locals.pb.collection('users').update(locals.userRecord.id, {
			uuid: '',
			ign: '',
		});

		return { success: true };
	},
};
