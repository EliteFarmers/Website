import type { Handle, RequestEvent } from '@sveltejs/kit';
import { FetchDiscordUser, type DiscordUpdateResponse } from '$lib/discordAuth';

export const handle: Handle = async ({ event, resolve }) => {
	const { locals, cookies } = event;

	const access = event.cookies.get('discord_access_token');
	const refresh = event.cookies.get('discord_refresh_token');

	locals.discord_access_token = access;
	locals.discord_refresh_token = refresh;

	if (!locals.discord_access_token && !locals.discord_refresh_token) {
		locals.discordUser = undefined;

		return await resolve(event);
	}

	const discord = await FetchDiscordUser({
		accessToken: locals.discord_access_token,
		refreshToken: locals.discord_refresh_token,
	});

	if (!discord) {
		locals.discordUser = undefined;

		cookies.delete('discord_access_token');
		cookies.delete('discord_refresh_token');
		// Log them out of PocketBase in order to get Discord tokens again on login
		cookies.delete('pocketbase_auth');

		return await resolve(event);
	}

	locals.discordUser = discord.user ?? undefined;

	updateCookies(event, discord);

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

function updateCookies(event: RequestEvent, discord: DiscordUpdateResponse) {
	if (!discord) return;

	const { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires } = discord;

	if (accessToken && accessTokenExpires) {
		event.cookies.set('discord_access_token', accessToken, {
			path: '/',
			expires: new Date(accessTokenExpires),
		});

		event.locals.discord_access_token = accessToken;
	} else if (!accessToken) {
		event.cookies.delete('discord_access_token');
	}

	if (refreshToken && refreshTokenExpires) {
		event.cookies.set('discord_refresh_token', refreshToken, {
			path: '/',
			expires: new Date(refreshTokenExpires),
		});

		event.locals.discord_refresh_token = refreshToken;
	} else if (!refreshToken) {
		event.cookies.delete('discord_refresh_token');
	}
}
