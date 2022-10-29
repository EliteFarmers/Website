import { PUBLIC_DISCORD_CLIENT_ID as CLIENT_ID, PUBLIC_DISCORD_REDIRECT_ROUTE } from '$env/static/public';
import { DISCORD_CLIENT_SECRET as CLIENT_SECRET } from '$env/static/private';
import { error, redirect } from '@sveltejs/kit';
import { authStateVal } from '$stores/auth';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const errorMsg = url.searchParams.get('error');

	if (errorMsg) {
		throw error(400, errorMsg);
	}

	if (!code || !state || state !== authStateVal) {
		throw error(400, 'Missing code or state');
	}

	const data = {
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		grant_type: 'authorization_code',
		code: code,
		redirect_uri: url.origin + PUBLIC_DISCORD_REDIRECT_ROUTE,
		state: state,
		scope: 'identify guilds',
	};

	const request = await fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		body: new URLSearchParams(data),
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
		throw error(400, new Error('Discord Authentication Error'));
	}

	const thirtyDays = 30 * 24 * 60 * 60 * 1000;
	const accessTokenExpires = new Date(Date.now() + response.expires_in); // ~10 minutes
	const refreshTokenExpires = new Date(Date.now() + thirtyDays); // 30 days

	// const headers = new Headers();
	// headers.append(
	// 	'Set-Cookie',
	// 	`discord_access_token=${
	// 		response.access_token
	// 	}; Expires=${accessTokenExpires.toUTCString()}; Path=/; SameSite=Strict; HttpOnly;`
	// );
	// headers.append(
	// 	'Set-Cookie',
	// 	`discord_refresh_token=${
	// 		response.refresh_token
	// 	}; Expires=${refreshTokenExpires.toUTCString()}; Path=/; SameSite=Strict; HttpOnly;`
	// );
	// headers.set('Location', '/');

	cookies.set('discord_access_token', response.access_token, {
		expires: accessTokenExpires,
		maxAge: response.expires_in,
		path: '/',
	});
	cookies.set('discord_refresh_token', response.refresh_token, {
		expires: refreshTokenExpires,
		maxAge: thirtyDays,
		path: '/',
	});

	throw redirect(303, '/login?success=true');
};
