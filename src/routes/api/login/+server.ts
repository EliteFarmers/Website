import { PUBLIC_DISCORD_CLIENT_ID as CLIENT_ID, PUBLIC_DISCORD_REDIRECT_ROUTE } from '$env/static/public';
import { DISCORD_CLIENT_SECRET as CLIENT_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	if (!code || !state) {
		return new Response('Missing code or state', { status: 400 });
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
		return new Response(undefined, { status: 302, headers: { Location: '/' } });
	}

	const accessTokenExpires = new Date(Date.now() + response.expires_in); // ~10 minutes
	const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

	const headers = new Headers();
	headers.append(
		'Set-Cookie',
		`discord_access_token=${
			response.access_token
		}; Expires=${accessTokenExpires.toUTCString()}; Path=/; SameSite=Strict; HttpOnly;`
	);
	headers.append(
		'Set-Cookie',
		`discord_refresh_token=${
			response.refresh_token
		}; Expires=${refreshTokenExpires.toUTCString()}; Path=/; SameSite=Strict; HttpOnly;`
	);
	headers.set('Location', '/');

	return new Response(undefined, { status: 302, headers });
};
