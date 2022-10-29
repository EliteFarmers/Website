import cookie from 'cookie';
import type { Handle } from '@sveltejs/kit';
import { PUBLIC_DISCORD_URL as DISCORD_API_URL, PUBLIC_HOST_URL } from '$env/static/public';
import { DBReady, GetUserByDiscordID, SyncTables, UpdateDiscordUser } from '$db/database';
import type { DiscordUser } from '$db/models/users';

interface CookieData {
	name: string;
	value: string;
	expires: string;
}

export const handle: Handle = async ({ event, resolve }) => {
	if (!DBReady) {
		void SyncTables();
	}

	const browserCookies = cookie.parse(event.request.headers.get('cookie') ?? '');

	event.locals.discord_access_token = browserCookies.discord_access_token;
	event.locals.discord_refresh_token = browserCookies.discord_refresh_token;

	if (!event.locals.discord_access_token && !event.locals.discord_refresh_token) {
		event.locals.discordUser = false;
		event.locals.user = false;

		return await resolve(event);
	}

	const { session, cookies } = await getUser(event.locals);
	const { discordUser, user } = session;

	event.locals.discordUser = discordUser;
	event.locals.user = user;

	if (cookies && cookies.length > 0) {
		for (const { name, value, expires } of cookies) {
			if (value === 'deleted') {
				event.cookies.delete(name);
			} else {
				event.cookies.set(name, value, {
					path: '/',
					expires: new Date(expires),
				});
			}
		}
	}

	return await resolve(event);
};

async function getUser(locals: App.Locals): Promise<{ session: App.Session; cookies?: CookieData[] }> {
	if (!locals.discord_access_token && !locals.discord_refresh_token) {
		return { session: { discordUser: false, user: false } };
	}

	if (!locals.discord_access_token && locals.discord_refresh_token) {
		return refreshUser(locals.discord_refresh_token);
	}

	if (locals.discord_access_token) {
		const data = await fetchUser(locals.discord_access_token);
		if (data.session.discordUser) return data;

		if (locals.discord_refresh_token) {
			return refreshUser(locals.discord_refresh_token);
		}
	}

	// not authenticated, return empty user object
	return {
		session: {
			discordUser: false,
			user: false,
		},
	};
}

async function fetchUser(token: string): Promise<{ session: App.Session; cookies?: CookieData[] }> {
	const request = await fetch(`${DISCORD_API_URL}/users/@me`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	// returns a discord user if JWT was valid
	const response = (await request.json()) as DiscordUser;
	const discordUser = { ...response };

	const user = (await GetUserByDiscordID(response.id)) ?? false;

	if (user !== false && user.id) {
		void UpdateDiscordUser(user.id, discordUser);
	}

	if (response.id) {
		return { session: { discordUser: discordUser, user: user } };
	} else {
		return { session: { discordUser: false, user: false } };
	}
}

async function refreshUser(token: string): Promise<{ session: App.Session; cookies?: CookieData[] }> {
	const failure: { session: App.Session; cookies?: CookieData[] } = {
		session: {
			discordUser: false,
			user: false,
		},
		cookies: [
			{
				name: 'discord_access_token',
				value: 'deleted',
				expires: new Date(0).toUTCString(),
			},
			{
				name: 'discord_refresh_token',
				value: 'deleted',
				expires: new Date(0).toUTCString(),
			},
		],
	};
	const discord_request = await fetch(`${HOST}/api/refresh?code=${token}`);

	try {
		const discord_response = (await discord_request.json()) as {
			discord_access_token: string;
			cookies: CookieData[];
		};

		if (!discord_response.discord_access_token) return failure;

		const request = await fetch(`${DISCORD_API_URL}/users/@me`, {
			headers: { Authorization: `Bearer ${discord_response.discord_access_token}` },
		});

		const response = (await request.json()) as DiscordUser;
		const discordUser = { ...response };

		const user = (await GetUserByDiscordID(discordUser.id)) ?? false;

		if (user !== false && user.id) {
			void UpdateDiscordUser(user.id, discordUser);
		}

		if (response.id) {
			return {
				session: { discordUser: discordUser, user: user },
				cookies: discord_response.cookies,
			};
		}
	} catch (error) {
		return failure;
	}

	return failure;
}
