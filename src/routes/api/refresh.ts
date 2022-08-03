import type { RequestHandler } from './__types/refresh';
import { PUBLIC_DISCORD_CLIENT_ID, PUBLIC_DISCORD_REDIRECT_URI } from '$env/static/public';
import { DISCORD_CLIENT_SECRET } from '$env/static/private';
import crypto from 'crypto';

const DISCORD_CLIENT_ID = PUBLIC_DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = PUBLIC_DISCORD_REDIRECT_URI;

export const GET: RequestHandler = async ({ url }) => {
	const refreshToken = url.searchParams.get('code');

	const uuid = crypto.randomUUID();

	if (!refreshToken) {
		return {
			status: 500,
			body: { error: 'No refresh token found' }
		};
	}

	const data = {
		client_id: DISCORD_CLIENT_ID,
		client_secret: DISCORD_CLIENT_SECRET,
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
		redirect_uri: DISCORD_REDIRECT_URI,
		state: uuid,
		scope: 'identify email guilds',
	};

	const body = new URLSearchParams(data);

	const request = await fetch(`https://discord.com/api/oauth2/token`, {
		method: 'POST',
		body: body,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});

	const response = await request.json();

	if (response.error) {
		return {
			status: 400,
			body: { error: response.error }
		};
	}

	const accessTokenExpires = new Date(Date.now() + response.expires_in); // ~10 minutes
	const refreshTokenExpires = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days

	return {
		status: 200,
		headers: { 
			'Set-Cookie': [
				`discord_access_token=${response.access_token}; Expires=${accessTokenExpires.toUTCString()}; Path=/; HttpOnly; SameSite=Strict;`,
				`discord_refresh_token=${response.refresh}; Expires=${refreshTokenExpires.toUTCString()}; Path=/; HttpOnly; SameSite=Strict;`,
			],
		},
		body: { 'discord_access_token': response.access_token }
	};
}
