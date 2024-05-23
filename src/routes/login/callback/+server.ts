import { error, redirect } from '@sveltejs/kit';
import { DISCORD_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_DISCORD_REDIRECT_ROUTE, PUBLIC_DISCORD_CLIENT_ID } from '$env/static/public';
import type { RequestHandler } from './$types';
import type { components } from '$lib/api/api';
import { LoginUser } from '$lib/api/elite';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const errorMsg = url.searchParams.get('error');

	const storedState = cookies.get('auth_state');
	cookies.delete('auth_state', { path: '/' });

	if (errorMsg) {
		throw error(400, errorMsg);
	}

	if (!code || !state || state !== storedState) {
		throw error(400, 'Missing code or state');
	}

	const data = {
		client_id: PUBLIC_DISCORD_CLIENT_ID,
		client_secret: DISCORD_CLIENT_SECRET,
		grant_type: 'authorization_code',
		code: code,
		redirect_uri: url.origin + PUBLIC_DISCORD_REDIRECT_ROUTE,
		state: state,
		scope: 'identify guilds role_connections.write',
	};

	const request = await fetch('https://discord.com/api/v10/oauth2/token', {
		method: 'POST',
		body: new URLSearchParams(data),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});

	const response = (await request.json()) as components['schemas']['DiscordLoginDto'] & { error?: unknown };

	console.log('response', response);

	if (response.error) {
		throw error(400, new Error('Discord Authentication Error'));
	}

	const { data: loginResponse } = await LoginUser({
		access_token: response.access_token,
		expires_in: Math.floor(+response.expires_in / 1000).toString(),
		refresh_token: response.refresh_token,
	}).catch(() => ({ data: undefined }));

	if (!loginResponse) {
		throw error(500, 'Failed to login user!');
	}

	console.log('loginResponse', loginResponse);

	const thirtyDays = 30 * 24 * 60 * 60;
	const refreshTokenExpires = new Date(Date.now() + thirtyDays); // 30 days

	cookies.set('access_token', loginResponse.access_token, {
		// The access token expires every 10 minutes, but we keep it to use with the refresh token
		expires: refreshTokenExpires,
		maxAge: thirtyDays,
		path: '/',
	});

	cookies.set('refresh_token', loginResponse.refresh_token, {
		expires: refreshTokenExpires,
		maxAge: thirtyDays,
		path: '/',
	});

	throw redirect(303, '/login?success=true&redirect=/profile');
};
