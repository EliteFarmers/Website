import type { RequestHandler } from './__types/login';
import { PUBLIC_DISCORD_CLIENT_ID as CLIENT_ID, PUBLIC_DISCORD_REDIRECT_URI as REDIRECT_URI } from '$env/static/public';
import { DISCORD_CLIENT_SECRET as CLIENT_SECRET } from '$env/static/private';

export const GET: RequestHandler = async ({ url }) => {

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	if (!code || !state) {
		return {
			status: 400,
			body: 'Missing code or state',
		}
	}

	const data = {
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		grant_type: 'authorization_code',
		code: code,
		redirect_uri: REDIRECT_URI,
		state: state,
		scope: 'identify email guilds',
	};

	const request = await fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		body: new URLSearchParams(data),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});

	const response = await request.json();

	if (response.error) {
		return {
			status: 302,
			headers: { Location: '/' },
		}
	}
	
	const accessTokenExpires = new Date(Date.now() + response.expires_in); // ~10 minutes
	const refreshTokenExpires = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days

	return {
		headers: { 
			'Set-Cookie': [
				`discord_access_token=${response.access_token}; Expires=${accessTokenExpires.toUTCString()}; Path=/; SameSite=Strict; HttpOnly;`,
				`discord_refresh_token=${response.refresh_token}; Expires=${refreshTokenExpires.toUTCString()}; Path=/; SameSite=Strict; HttpOnly;`
			],
			Location: '/',
		},
		status: 302,
	}
}