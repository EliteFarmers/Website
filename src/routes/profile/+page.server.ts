import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { IsIGNOrUUID } from '$params/id';
import {
	GetPublicGuilds,
	GetUsersGuilds,
	LinkAccount,
	SetPrimaryAccount,
	UnlinkAccount,
	UpdateUserBadges,
} from '$lib/api/elite';
import type { components } from '$lib/api/api';
import { CanEditGuild, type Guild } from '$lib/discord';
import { IsUUID } from '$params/uuid';
import { FetchUserSession } from '$lib/api/auth';
import { FetchDiscordUserData } from '$lib/discordAuth';

export const load: PageServerLoad = async ({ locals, parent, url }) => {
	const { session } = await parent();
	const { access_token: token } = locals;

	if (!session || !token) {
		throw redirect(307, '/login?redirect=' + url.pathname);
	}

	const discord = await FetchDiscordUserData(token);

	if (!discord) {
		// No redirect to maybe prevent infinite loop
		throw error(401, '/login');
	}

	const account =
		discord.minecraftAccounts?.find((account) => account.primaryAccount) ?? discord.minecraftAccounts?.[0];

	const guilds =
		(await GetUsersGuilds(token)
			.then((guilds) => guilds.data ?? undefined)
			.catch(() => undefined)) ?? ([] as components['schemas']['GuildMemberDto'][]);

	const { data: publicGuilds } = await GetPublicGuilds().catch(() => ({ data: undefined }));

	return {
		guildsWithBot: guilds.filter((guild) => guild.hasBot && CanEditGuild(guild as Guild)),
		guilds: guilds.filter((guild) => !guild.hasBot),
		publicGuilds: (publicGuilds ?? []).filter((guild) => guilds.some((g) => g.id === guild.id)),
		premium: 'none' as string,
		mcAccount: account ?? null,
		user: discord,
	};
};

export const actions: Actions = {
	link: async ({ locals, request, cookies }) => {
		if (!locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const username = data.get('username')?.toString().trim();

		if (!username || !IsIGNOrUUID(username)) {
			return fail(400, { error: 'Invalid username.' });
		}

		const req = await LinkAccount(username, locals.access_token);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		if (!locals.session?.uuid) {
			await FetchUserSession(cookies, locals.access_token, locals.refresh_token, true);
		}

		return { success: true };
	},
	unlink: async ({ locals, request, cookies }) => {
		if (!locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const username = data.get('username')?.toString();

		if (!username || !IsIGNOrUUID(username)) {
			return fail(400, { error: 'Invalid username.' });
		}

		const req = await UnlinkAccount(username, locals.access_token);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		await FetchUserSession(cookies, locals.access_token, locals.refresh_token, true);

		return { success: true };
	},
	setPrimary: async ({ locals, request, cookies }) => {
		if (!locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const username = data.get('username')?.toString();

		if (!username || !IsIGNOrUUID(username)) {
			return fail(400, { error: 'Invalid username.' });
		}

		const req = await SetPrimaryAccount(username, locals.access_token);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		await FetchUserSession(cookies, locals.access_token, locals.refresh_token, true);

		return { success: true };
	},
	updateBadges: async ({ locals, request }) => {
		if (!locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const uuid = data.get('uuid')?.toString();

		if (!uuid || !IsUUID(uuid)) {
			return fail(400, { error: 'Invalid uuid.' });
		}

		const entries = Array.from(data.entries()).filter(([key]) => key.startsWith('badge.'));
		const badges = {} as Record<string, components['schemas']['EditUserBadgeDto']>;

		for (const [key, value] of entries) {
			const [, id, setting] = key.split('.');

			const badge = badges[+id] ?? (badges[+id] = { badgeId: +id });

			if (setting === 'visible') {
				badge.visible = value === 'true';
			}

			if (setting === 'order') {
				const num = Number(value);
				if (isNaN(num)) continue;

				badge.order = Math.min(entries.length, Math.max(0, num));
			}
		}

		const body = Object.values(badges);
		const req = await UpdateUserBadges(locals.access_token, uuid, body);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		return { success: true };
	},
};
