import type { Handle } from '@sveltejs/kit';
import { PUBLIC_DISCORD_URL as DISCORD_API_URL, PUBLIC_HOST_URL } from '$env/static/public';
import { DBReady, GetUserByDiscordID, SyncTables, UpdateDiscordUser } from '$db/database';
import type { DiscordUser } from '$db/models/users';
import { RefreshUser } from '$lib/discordAuth';

interface CookieData {
	name: string;
	value: string;
	expires: string;
}

export const handle: Handle = async ({ event, resolve }) => {
	if (!DBReady) {
		void SyncTables();
	}

	const access = event.cookies.get('discord_access_token');
	const refresh = event.cookies.get('discord_refresh_token');

	event.locals.discord_access_token = access;
	event.locals.discord_refresh_token = refresh;

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

	const response = await resolve(event);

	// Security headers
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('Referrer-Policy', 'no-referrer');
	response.headers.set(
		'Permissions-Policy',
		'accelerometer=(), autoplay=(), camera=(), document-domain=(), encrypted-media=(), fullscreen=(), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()'
	);
	response.headers.set('X-Content-Type-Options', 'nosniff');

	return response;
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

	// Not authenticated, return empty user object
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
	//const discord_request = await fetch(`/api/refresh?code=${token}`);

	try {
		const discordResponse = await RefreshUser(token, PUBLIC_HOST_URL + '/login/callback');

		if (!discordResponse.access_token) return failure;

		const request = await fetch(`${DISCORD_API_URL}/users/@me`, {
			headers: { Authorization: `Bearer ${discordResponse.access_token}` },
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
				cookies: [
					{
						name: 'discord_access_token',
						value: discordResponse.access_token,
						expires: discordResponse.access_token_expires,
					},
					{
						name: 'discord_refresh_token',
						value: discordResponse.refresh_token,
						expires: discordResponse.refresh_token_expires,
					},
				],
			};
		}
	} catch (error) {
		console.log(error);
		return failure;
	}

	return failure;
}
