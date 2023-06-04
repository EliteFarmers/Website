import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const errorMsg = url.searchParams.get('error');

	const storedState = cookies.get('auth_state');
	cookies.delete('auth_state');

	if (errorMsg) {
		throw error(400, errorMsg);
	}

	if (!code || !state || state !== storedState) {
		throw error(400, 'Missing code or state');
	}

	const tenMinutes = 10 * 60;
	const thirtyDays = 30 * 24 * 60 * 60;
	const accessTokenExpires = new Date(Date.now() + tenMinutes); // 10 minutes
	const refreshTokenExpires = new Date(Date.now() + thirtyDays); // 30 days

	cookies.set('discord_access_token', authData.meta.accessToken as string, {
		expires: accessTokenExpires,
		maxAge: tenMinutes,
		path: '/',
	});
	cookies.set('discord_refresh_token', authData.meta.refreshToken as string, {
		expires: refreshTokenExpires,
		maxAge: thirtyDays,
		path: '/',
	});

	throw redirect(303, '/');
};
