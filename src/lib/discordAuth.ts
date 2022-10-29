import { PUBLIC_DISCORD_CLIENT_ID as CLIENT_ID, PUBLIC_DISCORD_URL } from "$env/static/public";
import { DISCORD_CLIENT_SECRET } from "$env/static/private";
import crypto from 'crypto';

export async function RefreshUser(refreshToken: string, redirect: string) {

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
		return { error: response.error };
	}

	const accessTokenExpires = new Date(Date.now() + response.expires_in); // ~10 minutes
	const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

	return {
		access_token: response.access_token,
		access_token_expires: accessTokenExpires.toUTCString(),
		refresh_token: response.refresh_token,
		refresh_token_expires: refreshTokenExpires.toUTCString(),
	}
}