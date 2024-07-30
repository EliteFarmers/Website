import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GetPublicGuilds, GetUsersGuilds } from '$lib/api/elite';
import type { components } from '$lib/api/api';
import { FetchDiscordUserData } from '$lib/discordAuth';

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
		adminGuilds: guilds.filter((guild) => guild.hasBot && guild.admin),
		guilds: guilds.filter((guild) => !guild.hasBot),
		publicGuilds: (publicGuilds ?? []).filter((guild) => guilds.some((g) => g.id === guild.id)),
		mcAccount: account ?? null,
		user: discord,
	};
};
