import cookie from 'cookie';
import type { GetSession, Handle } from '@sveltejs/kit';
import { PUBLIC_DISCORD_URL as DISCORD_API_URL, PUBLIC_HOST_URL as HOST, } from '$env/static/public';
import { GetUserByDiscordID, UpdateDiscordUser } from '$db/database';

export const handle: Handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get("cookie") || "");

	event.locals.discord_access_token = cookies.discord_access_token;
	event.locals.discord_refresh_token = cookies.discord_refresh_token;

	return await resolve(event);
}

export const getSession: GetSession = async ({ locals }) => {

	const cookies = {
		discord_access_token: locals.discord_access_token,
		discord_refresh_token: locals.discord_refresh_token,
	}

	if (!cookies.discord_access_token && !cookies.discord_refresh_token) return { discordUser: false, user: false };

	if (!cookies.discord_access_token) {
		const discord_request = await fetch(`${HOST}/api/refresh?code=${cookies.discord_refresh_token}`);

		if (discord_request.status !== 200) return { discordUser: false, user: false };

		try {
			const discord_response = await discord_request.json();

			if (!discord_response.discord_access_token) return { discordUser: false, user: false }

			const request = await fetch(`${DISCORD_API_URL}/users/@me`, {
				headers: { 'Authorization': `Bearer ${discord_response.discord_access_token}` }
			});

			const response = await request.json();
			const discordUser = { ...response };

			const user = (await GetUserByDiscordID(discordUser.id)) ?? false;

			if (user && user.id) {
				UpdateDiscordUser(user.id, discordUser);
			}

			if (response.id) return { discordUser: discordUser, user: user };
		} catch (error) {
			return { discordUser: false, user: false }
		}
	}

	if (cookies.discord_access_token) {
		const request = await fetch(`${DISCORD_API_URL}/users/@me`, {
			headers: { 'Authorization': `Bearer ${cookies.discord_access_token}`}
		});

		// returns a discord user if JWT was valid
		const response = await request.json();
		const discordUser = { ...response };

		const user = (await GetUserByDiscordID(response.id)) ?? false;

		if (user && user.id) {
			UpdateDiscordUser(user.id, discordUser);
		}

		if (response.id) return { discordUser: discordUser, user: user };
	}

	// not authenticated, return empty user object
	return {
		discordUser: false,
		user: false
	}
}