import type { Handle, RequestEvent } from '@sveltejs/kit';
import { FetchDiscordUser, type DiscordUpdateResponse } from '$lib/discordAuth';
import type { UserInfo } from '$lib/api/elite';

export const handle: Handle = async ({ event, resolve }) => {
	const { locals, cookies } = event;

	const access = event.cookies.get('discord_access_token');
	const refresh = event.cookies.get('discord_refresh_token');

	let discord;

	// User info is just for the navbar, it doesn't need to be perfectly secure
	const userInfoString = event.cookies.get('user_info');
	if (userInfoString) {
		try {
			locals.userInfo = JSON.parse(userInfoString) as UserInfo;
		} catch (e) {
			locals.userInfo = undefined;
		}
	} else if (access || refresh) {
		// Update the user info cookie
		discord = await FetchDiscordUser({
			accessToken: access,
			refreshToken: refresh,
		});

		if (discord) updateCookies(event, discord);
	}

	locals.discord_access_token = access;
	locals.discord_refresh_token = refresh;

	// If the user has no tokens, or the route is not an auth route, we don't need to do anything
	if (!event.route.id?.includes('/(auth)/') || (!locals.discord_access_token && !locals.discord_refresh_token)) {
		locals.user = undefined;

		return await ResolveWithSecurityHeaders(resolve, event);
	}

	discord =
		discord ??
		(await FetchDiscordUser({
			accessToken: locals.discord_access_token,
			refreshToken: locals.discord_refresh_token,
		}));

	if (!discord) {
		locals.user = undefined;

		cookies.delete('discord_access_token');
		cookies.delete('discord_refresh_token');

		return await ResolveWithSecurityHeaders(resolve, event);
	}

	locals.user = discord.user ?? undefined;

	updateCookies(event, discord);

	return await ResolveWithSecurityHeaders(resolve, event);
};

async function ResolveWithSecurityHeaders(
	resolve: Parameters<Handle>[0]['resolve'],
	event: Parameters<Handle>[0]['event']
): Promise<ReturnType<Handle>> {
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
}

function updateCookies(event: RequestEvent, discord: DiscordUpdateResponse) {
	if (!discord) return;

	const { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires, user } = discord;

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

	if (!user?.id || !user.avatar || !user.username) return;

	const primary = user.minecraftAccounts?.find((account) => account.primaryAccount);

	event.cookies.set(
		'user_info',
		JSON.stringify({
			id: user.id,
			username: user.username,
			avatar: user.avatar,
			primaryName: primary?.name ?? undefined,
			primaryUuid: primary?.id ?? undefined,
		} satisfies UserInfo),
		{
			path: '/',
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
		}
	);
}
