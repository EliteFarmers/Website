import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { IsIGNOrUUID } from '$params/id';
import { GetUsersGuilds, LinkAccount, SetPrimaryAccount, UnlinkAccount } from '$lib/api/elite';
import type { components } from '$lib/api/api';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { user } = await parent();
	const { discord_access_token: token } = locals;

	if (!user.id || !token) {
		throw redirect(302, '/');
		//throw redirect(302, '/login?redirect=/profile');
	}

	const account = user.minecraftAccounts?.find((account) => account.primaryAccount) ?? user.minecraftAccounts?.[0];

	const guilds = (await GetUsersGuilds(token).then((guilds) => guilds.data ?? undefined).catch(() => undefined)) ?? [] as components['schemas']['UserGuildDto'][];

	console.log('guilds', guilds.filter((guild) => guild.hasBot));

	return {
		guildsWithBot: guilds.filter((guild) => guild.hasBot),
		guilds: guilds.filter((guild) => !guild.hasBot),
		premium: 'none' as string,
		mcAccount: account ?? null,
	};
};

export const actions: Actions = {
	link: async ({ locals, request }) => {
		if (!locals.discord_access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const username = data.get('username')?.toString().trim();

		if (!username || !IsIGNOrUUID(username)) {
			return fail(400, { error: 'Invalid username.' });
		}

		const req = await LinkAccount(username, locals.discord_access_token);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		return { success: true };
	},
	unlink: async ({ locals, request }) => {
		if (!locals.discord_access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const username = data.get('username')?.toString();

		if (!username || !IsIGNOrUUID(username)) {
			console.log('username', username);
			return fail(400, { error: 'Invalid username.' });
		}

		const req = await UnlinkAccount(username, locals.discord_access_token);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		return { success: true };
	},
	setPrimary: async ({ locals, request }) => {
		if (!locals.discord_access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const username = data.get('username')?.toString();

		if (!username || !IsIGNOrUUID(username)) {
			return fail(400, { error: 'Invalid username.' });
		}

		const req = await SetPrimaryAccount(username, locals.discord_access_token);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		return { success: true };
	},
};
