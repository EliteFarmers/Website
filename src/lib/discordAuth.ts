import { PUBLIC_DISCORD_CLIENT_ID as CLIENT_ID, PUBLIC_DISCORD_URL, PUBLIC_HOST_URL } from '$env/static/public';
import { DISCORD_CLIENT_SECRET } from '$env/static/private';
import { GetAuthorizedAccount, type AuthorizedUser, type UserInfo } from '$lib/api/elite';
import crypto from 'crypto';
import type { RequestEvent } from '@sveltejs/kit';

export type DiscordUpdateResponse = {
	accessToken: string;
	accessTokenExpires?: string;
	refreshToken: string;
	refreshTokenExpires?: string;
	user: AuthorizedUser | null;
} | null;

export async function FetchDiscordUser(tokens: {
	accessToken?: string;
	refreshToken?: string;
}): Promise<DiscordUpdateResponse> {
	let { accessToken, refreshToken } = tokens;
	let accessExpires: string | undefined;
	let refreshExpires: string | undefined;

	if (!accessToken && !refreshToken) return null;

	if (!accessToken && refreshToken) {
		const fresh = await RefreshDiscordUser(refreshToken, PUBLIC_HOST_URL + '/login/callback');
		if (!fresh) return null;

		accessToken = fresh.accessToken;
		refreshToken = fresh.refreshToken;
		accessExpires = fresh.accessTokenExpires;
		refreshExpires = fresh.refreshTokenExpires;
	}

	if (!accessToken || !refreshToken) return null;

	const user = await FetchDiscordUserData(accessToken);

	if (!user) return null;

	return {
		accessToken: accessToken,
		accessTokenExpires: accessExpires ?? undefined,
		refreshToken: refreshToken,
		refreshTokenExpires: refreshExpires ?? undefined,
		user: user,
	};
}

export async function FetchDiscordUserData(accessToken: string): Promise<AuthorizedUser | null> {
	const { data } = await GetAuthorizedAccount(accessToken);

	if (!data) return null;

	try {
		return data;
	} catch (_) {
		return null;
	}
}

export async function RefreshDiscordUser(refreshToken: string, redirect: string): Promise<DiscordUpdateResponse> {
	const uuid = crypto.randomUUID();

	const data = {
		client_id: CLIENT_ID,
		client_secret: DISCORD_CLIENT_SECRET,
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
		redirect_uri: redirect,
		scope: 'identify guilds',
		state: uuid,
	};

	const body = new URLSearchParams(data);

	const request = await fetch(PUBLIC_DISCORD_URL + '/oauth2/token', {
		method: 'POST',
		body: body,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});

	const response = (await request.json()) as {
		access_token: string;
		expires_in: number;
		refresh_token: string;
		error?: unknown;
	};

	if (response.error) {
		return null;
	}

	const accessTokenExpires = new Date(Date.now() + response.expires_in); // ~10 minutes
	const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

	return {
		accessToken: response.access_token,
		accessTokenExpires: accessTokenExpires.toUTCString(),
		refreshToken: response.refresh_token,
		refreshTokenExpires: refreshTokenExpires.toUTCString(),
		user: null,
	};
}

export function UpdateCookies(event: RequestEvent, discord: DiscordUpdateResponse) {
	if (!discord) return;

	const { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires, user } = discord;

	if (accessToken && accessTokenExpires) {
		event.cookies.set('discord_access_token', accessToken, {
			path: '/',
			expires: new Date(accessTokenExpires),
		});

		event.locals.access_token = accessToken;
	} else if (!accessToken) {
		event.cookies.delete('discord_access_token', { path: '/' });
	}

	if (refreshToken && refreshTokenExpires) {
		event.cookies.set('discord_refresh_token', refreshToken, {
			path: '/',
			expires: new Date(refreshTokenExpires),
		});

		event.locals.refresh_token = refreshToken;
	} else if (!refreshToken) {
		event.cookies.delete('discord_refresh_token', { path: '/' });
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
