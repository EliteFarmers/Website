import { getPublicGuilds, getUserGuilds, refreshGuildMemberships, type GuildMemberDto } from '$lib/api';
import { FetchDiscordUserData } from '$lib/api/auth';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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
	let refreshWarning: string | null = null;
	let reconnectDiscord = false;

	try {
		const refresh = await refreshGuildMemberships();
		if (!refresh.ok && refresh.response.status !== 429) {
			reconnectDiscord = refresh.response.status === 401;
			refreshWarning = reconnectDiscord
				? 'Discord authorization has expired. Reconnect Discord to refresh your server permissions.'
				: 'Discord server permissions could not be refreshed right now. Showing the last known data.';
		}
	} catch {
		refreshWarning = 'Discord server permissions could not be refreshed right now. Showing the last known data.';
	}

	const guilds =
		(await getUserGuilds()
			.then((guilds) => guilds.data ?? undefined)
			.catch(() => undefined)) ?? ([] as GuildMemberDto[]);

	const { data: publicGuilds } = await getPublicGuilds().catch(() => ({ data: undefined }));

	return {
		adminGuilds: guilds.filter((guild) => guild.hasBot && guild.admin),
		guilds: guilds.filter((guild) => !guild.hasBot),
		publicGuilds: (publicGuilds ?? []).filter((guild) => guilds.some((g) => g.id === guild.id)),
		mcAccount: account ?? null,
		user: discord,
		refreshWarning,
		reconnectDiscord,
	};
};

export const actions: Actions = {
	refreshGuilds: async ({ locals }) => {
		if (!locals.session || !locals.access_token)
			return fail(401, { refreshError: 'Unauthorized', reconnect: false });

		try {
			const refresh = await refreshGuildMemberships();
			if (refresh.ok) return { refreshSuccess: 'Discord server permissions refreshed.', reconnect: false };
			if (refresh.response.status === 429)
				return { refreshSuccess: 'Discord server permissions were refreshed recently.', reconnect: false };

			const reconnect = refresh.response.status === 401;
			return fail(
				refresh.response.status >= 400 && refresh.response.status <= 599 ? refresh.response.status : 500,
				{
					refreshError: reconnect
						? 'Discord authorization has expired. Reconnect Discord and try again.'
						: 'Discord server permissions could not be refreshed right now.',
					reconnect,
				}
			);
		} catch {
			return fail(503, {
				refreshError: 'Discord server permissions could not be refreshed right now.',
				reconnect: false,
			});
		}
	},
};
