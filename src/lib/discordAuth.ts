import { PUBLIC_DISCORD_CLIENT_ID as CLIENT_ID, PUBLIC_DISCORD_URL, PUBLIC_HOST_URL } from '$env/static/public';
import { DISCORD_CLIENT_SECRET } from '$env/static/private';
import crypto from 'crypto';
import type { DiscordUser } from '$db/models/users';

export type DiscordUpdateResponse = {
	accessToken: string;
	accessTokenExpires?: string;
	refreshToken: string;
	refreshTokenExpires?: string;
	user: DiscordUser | null;
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

	const user = await fetchDiscordUser(accessToken);

	if (!user) return null;

	return {
		accessToken: accessToken,
		accessTokenExpires: accessExpires ?? undefined,
		refreshToken: refreshToken,
		refreshTokenExpires: refreshExpires ?? undefined,
		user: user,
	};
}

async function fetchDiscordUser(accessToken: string): Promise<DiscordUser | null> {
	const request = await fetch(`${PUBLIC_DISCORD_URL}/users/@me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!request.ok) return null;

	try {
		const response = (await request.json()) as DiscordUser;
		const discordUser = { ...response };

		return discordUser;
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
