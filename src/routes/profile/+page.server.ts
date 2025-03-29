import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { IsIGNOrUUID } from '$params/id';
import {
	GetPublicGuilds,
	GetUsersGuilds,
	LinkAccount,
	RefreshPurchases,
	SetPrimaryAccount,
	UnlinkAccount,
	UpdateUserBadges,
	UpdateUserSettings,
} from '$lib/api/elite';
import type { components } from '$lib/api/api';
import { CanEditGuild } from '$lib/discord';
import { IsUUID } from '$params/uuid';
import { FetchUserSession, FetchDiscordUserData } from '$lib/api/auth';

export const load: PageServerLoad = async ({ locals, parent, url }) => {
	const { session } = await parent();
	const { access_token: token } = locals;

	if (!session || !token) {
		throw redirect(307, '/login?redirect=' + url.pathname);
	}

	const discord = await FetchDiscordUserData(token);

	if (!discord) {
		throw redirect(307, '/login?redirect=' + url.pathname);
	}

	const account =
		discord.minecraftAccounts?.find((account) => account.primaryAccount) ?? discord.minecraftAccounts?.[0];

	const guilds =
		(await GetUsersGuilds(token)
			.then((guilds) => guilds.data ?? undefined)
			.catch(() => undefined)) ?? ([] as components['schemas']['GuildMemberDto'][]);

	const { data: publicGuilds } = await GetPublicGuilds().catch(() => ({ data: undefined }));

	return {
		guildsWithBot: guilds.filter((guild) => guild.hasBot && CanEditGuild(guild)),
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

		const { error: problem, response } = await LinkAccount(username, locals.access_token);
		console.log(response);

		if (!response.ok || problem) {
			console.log(problem);
			return fail(response.status, {
				error: 'Error linking account, please check spelling and that your Discord account is correctly linked on Hypixel.',
				problem: problem,
			});
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

		const { error: problem, response } = await UnlinkAccount(username, locals.access_token);

		if (!response.ok || problem) {
			return fail(response.status, {
				error: problem?.message || 'Error unlinking account, please try again later.',
				problem: problem,
			});
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
	updateSettings: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const body = {
			features: {} as components['schemas']['ConfiguredProductFeaturesDto'],
			weightStyleId: undefined as number | undefined,
		} satisfies components['schemas']['UpdateUserSettingsDto'];

		const style = data.get('style')?.toString() ?? undefined;
		if (style !== undefined && isFinite(+style)) {
			body.weightStyleId = +style;
		}

		const embed = data.get('embed')?.toString() ?? undefined;
		if (embed !== undefined) {
			body.features.embedColor = embed;
		}

		const promotions = data.get('promotions') ?? undefined;
		if (promotions) {
			body.features.hideShopPromotions = promotions === 'true';
		}

		const override = data.get('override') ?? undefined;
		if (override) {
			body.features.weightStyleOverride = override === 'true';
		}

		const info = data.get('info') ?? undefined;
		if (info) {
			body.features.moreInfoDefault = info === 'true';
		}

		const req = await UpdateUserSettings(locals.access_token, body);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		return { success: true };
	},
	refreshPurchases: async ({ locals }) => {
		if (!locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const req = await RefreshPurchases(locals.access_token);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		return { success: true };
	},
};
