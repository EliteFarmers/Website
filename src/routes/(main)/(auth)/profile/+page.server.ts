import {
	getPublicGuilds,
	getUserGuilds,
	linkOwnAccount,
	refreshPurchases,
	searchAccountsWithDiscord,
	setPrimaryAccount,
	unlinkOwnAccount,
	updateAccount,
	updateBadges,
	type ConfiguredProductFeaturesDto,
	type EditUserBadgeDto,
	type GuildMemberDto,
	type UpdateUserSettingsDto,
} from '$lib/api';
import { FetchDiscordUserData, FetchUserSession } from '$lib/api/auth';
import { CanEditGuild } from '$lib/discord';
import { IsIGNOrUUID } from '$params/id';
import { IsUUID } from '$params/uuid';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent, url }) => {
	const { session } = await parent();
	const { access_token: token } = locals;

	if (!session || !token) {
		throw redirect(307, '/login?redirect=' + url.pathname);
	}

	const discord = await FetchDiscordUserData();

	if (!discord) {
		throw redirect(307, '/login?redirect=' + url.pathname);
	}

	const account =
		discord.minecraftAccounts?.find((account) => account.primaryAccount) ?? discord.minecraftAccounts?.[0];

	const guilds =
		(await getUserGuilds()
			.then((guilds) => guilds.data ?? undefined)
			.catch(() => undefined)) ?? ([] as GuildMemberDto[]);

	const { data: publicGuilds } = await getPublicGuilds().catch(() => ({ data: undefined }));

	const otherAccounts = searchAccountsWithDiscord().then((res) => res.data ?? []);

	return {
		guildsWithBot: guilds.filter((guild) => guild.hasBot && CanEditGuild(guild)),
		guilds: guilds.filter((guild) => !guild.hasBot),
		publicGuilds: (publicGuilds ?? []).filter((guild) => guilds.some((g) => g.id === guild.id)),
		premium: 'none' as string,
		mcAccount: account ?? null,
		user: discord,
		otherAccounts: otherAccounts,
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

		const { error: problem, response } = await linkOwnAccount(username);

		if (!response.ok || problem) {
			return fail(response.status, {
				error: 'Error linking account, please check spelling and that your Discord account is correctly linked on Hypixel.',
				problem: problem,
			});
		}

		if (!locals.session?.uuid) {
			await FetchUserSession(cookies, false, true);
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

		const { error: problem, response } = await unlinkOwnAccount(username);

		if (!response.ok || problem) {
			return fail(response.status, {
				error: problem || 'Error unlinking account, please try again later.',
				problem: problem,
			});
		}

		await FetchUserSession(cookies, false, true);

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

		const { response, error: e } = await setPrimaryAccount(username);

		if (!response.ok || e) {
			return fail(response.status, {
				error: e || 'Error setting primary account, please try again later.',
			});
		}

		await FetchUserSession(cookies, false, true);

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
		const badges = {} as Record<string, EditUserBadgeDto>;

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
		const { response, error: e } = await updateBadges(uuid, body);

		if (!response.ok || e) {
			return fail(response.status, {
				error: e || 'Error updating badges, please try again later.',
			});
		}

		return { success: true };
	},
	updateSettings: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const body = {
			features: {} as ConfiguredProductFeaturesDto,
			weightStyleId: undefined as number | undefined,
		} satisfies UpdateUserSettingsDto;

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

		const { response, error: e } = await updateAccount(body);

		if (!response.ok || e) {
			return fail(response.status, {
				error: e || 'Error updating settings, please try again later.',
			});
		}

		return { success: true };
	},
	refreshPurchases: async ({ locals }) => {
		if (!locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const { response, error: e } = await refreshPurchases();

		if (!response.ok || e) {
			return fail(response.status, {
				error: e || 'Error refreshing purchases, please try again later.',
			});
		}

		return { success: true };
	},
};
