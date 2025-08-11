import { getPublicGuilds, getUserGuilds, type GuildMemberDto } from '$lib/api';
import { FetchDiscordUserData } from '$lib/api/auth';
import { redirect } from '@sveltejs/kit';
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
	};
};
