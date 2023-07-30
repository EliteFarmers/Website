import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { FetchDiscordUser, UpdateCookies } from '$lib/discordAuth';

export const load = (async (event) => {
	const { locals, url, cookies } = event;

	locals.discord_access_token ??= cookies.get('discord_access_token');
	locals.discord_refresh_token ??= cookies.get('discord_refresh_token');

	if (!locals.discord_access_token) {
		throw redirect(302, '/login?redirect=' + url.pathname);
	}

	if (!locals.user && locals.discord_access_token) {
		const discord = await FetchDiscordUser({
			accessToken: locals.discord_access_token,
			refreshToken: locals.discord_refresh_token,
		});

		locals.user = discord?.user ?? undefined;

		if (discord) {
			UpdateCookies(event, discord);
			console.log('updated cookies', discord);
		}
	}

	if (!locals.user || !locals.discord_access_token) {
		throw redirect(302, '/login?redirect=' + url.pathname);
	}

	return {
		user: locals.user,
	};
}) satisfies LayoutServerLoad;
