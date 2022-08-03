import { authStateVal } from '$stores/auth';
import type { RequestHandler } from './__types/callback';

import { DISCORD_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_DISCORD_CLIENT_ID, PUBLIC_DISCORD_REDIRECT_URI, PUBLIC_DISCORD_URL, PUBLIC_HOST_URL } from '$env/static/public';

const DISCORD_CLIENT_ID = PUBLIC_DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = PUBLIC_DISCORD_REDIRECT_URI;
const DISCORD_API_URL = PUBLIC_DISCORD_URL;

export const GET: RequestHandler = async ({ url }) => {
 
	const returnCode = url.searchParams.get('code');
	const returnState = url.searchParams.get('state') === authStateVal;

	if (!returnCode || !returnState) {
		return {
			status: 400,
			body: 'Missing code or state',
		}
	}

	const data = {
		client_id: DISCORD_CLIENT_ID,
		client_secret: DISCORD_CLIENT_SECRET,
		grant_type: 'authorization_code',
		code: returnCode,
		redirect_uri: DISCORD_REDIRECT_URI,
		state: authStateVal,
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
		console.log(response.error);
		return {
			status: 302,
			headers: { Location: '/' },
		}
	}
	
	const accessTokenExpires = new Date(Date.now() + response.expires_in); // ~10 minutes
	const refreshTokenExpires = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days

	let user = undefined;
	if (response.access_token) {
		const drequest = await fetch(`${DISCORD_API_URL}/users/@me`, {
			headers: { 'Authorization': `Bearer ${response.access_token}`}
		});

		// returns a discord user if JWT was valid
		const dresponse = await drequest.json();

		if (dresponse.id) {
			user = dresponse;
		}
	}

	return {
		headers: { 
			'Set-Cookie': [
				`discord_access_token=${response.access_token}; Expires=${accessTokenExpires.toUTCString()}; Path=/; SameSite=Strict; HttpOnly;`,
				`discord_refresh_token=${response.refresh_token}; Expires=${refreshTokenExpires.toUTCString()}; Path=/; SameSite=Strict; HttpOnly;`
			],
			Location: `${PUBLIC_HOST_URL}`,
			body: user
		},
		status: 302,
	}		
}