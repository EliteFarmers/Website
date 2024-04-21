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

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { user } = await parent();
	const { discord_access_token: token } = locals;

	if (!user.id || !token) {
		throw redirect(302, '/');
		//throw redirect(302, '/login?redirect=/profile');
	}

	const account = user.minecraftAccounts?.find((account) => account.primaryAccount) ?? user.minecraftAccounts?.[0];

	const guilds =
		(await GetUsersGuilds(token)
			.then((guilds) => guilds.data ?? undefined)
			.catch(() => undefined)) ?? ([] as components['schemas']['UserGuildDto'][]);

	const { data: publicGuilds } = await GetPublicGuilds().catch(() => ({ data: undefined }));

	return {
		guildsWithBot: guilds.filter((guild) => guild.hasBot && CanEditGuild(guild as Guild)),
		guilds: guilds.filter((guild) => !guild.hasBot),
		publicGuilds: (publicGuilds ?? []).filter((guild) => guilds.some((g) => g.id === guild.id)),
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
	updateBadges: async ({ locals, request }) => {
		if (!locals.discord_access_token) {
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
		const req = await UpdateUserBadges(locals.discord_access_token, uuid, body);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		return { success: true };
	},
};
