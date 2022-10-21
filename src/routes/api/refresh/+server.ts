import type { RequestHandler } from './$types';
import { PUBLIC_DISCORD_CLIENT_ID, PUBLIC_DISCORD_REDIRECT_URI } from '$env/static/public';
import { DISCORD_CLIENT_SECRET } from '$env/static/private';
import crypto from 'crypto';

const DISCORD_CLIENT_ID = PUBLIC_DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = PUBLIC_DISCORD_REDIRECT_URI;

export const GET: RequestHandler = async ({ url }) => {
	const refreshToken = url.searchParams.get('code');

	const uuid = crypto.randomUUID();

	if (!refreshToken) {
		return new Response(JSON.stringify({ error: 'No refresh token found' }), {
			status: 404,
		});
	}

	const data = {
		client_id: DISCORD_CLIENT_ID,
		client_secret: DISCORD_CLIENT_SECRET,
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
		redirect_uri: DISCORD_REDIRECT_URI,
		scope: 'identify guilds',
		state: uuid,
	};

	const body = new URLSearchParams(data);

	const request = await fetch('https://discord.com/api/oauth2/token', {
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
		return new Response(JSON.stringify({ error: response.error }), {
			status: 400,
		});
	}

	const accessTokenExpires = new Date(Date.now() + response.expires_in); // ~10 minutes
	const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

	return new Response(
		JSON.stringify({
			discord_access_token: response.access_token,
			cookies: [
				{
					name: 'discord_access_token',
					value: response.access_token,
					expires: accessTokenExpires.toUTCString(),
				},
				{
					name: 'discord_refresh_token',
					value: response.refresh_token,
					expires: refreshTokenExpires.toUTCString(),
				},
			],
		})
	);
};
