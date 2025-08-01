import { PUBLIC_DISCORD_REDIRECT_ROUTE } from '$env/static/public';
import { LoginUser } from '$lib/api/elite';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const errorMsg = url.searchParams.get('error');

	const storedState = cookies.get('auth_state');
	cookies.delete('auth_state', { path: '/' });

	if (errorMsg) {
		// If the user denies the request, redirect them back to the home page
		if (errorMsg === 'access_denied') {
			throw redirect(303, '/');
		}

		throw error(400, errorMsg);
	}

	if (!code || !state || !storedState || !state.startsWith(storedState)) {
		throw error(400, "Couldn't verify your request, please try again.");
	}

	const [, redirectTo = '', attemptCount = 0] = state.split('|');

	const {
		data: loginResponse,
		response: r,
		error: e,
	} = await LoginUser({
		code: code,
		redirect_uri: url.origin + PUBLIC_DISCORD_REDIRECT_ROUTE,
	});

	if (!loginResponse) {
		console.log(r);
		console.log(e);
		throw error(500, 'Failed to login user!');
	}

	const thirtyDays = 30 * 24 * 60 * 60;
	const refreshTokenExpires = new Date(Date.now() + thirtyDays * 1000); // 30 days

	cookies.set('access_token', loginResponse.access_token, {
		// The access token expires sooner, but we keep it to use with the refresh token
		expires: refreshTokenExpires,
		maxAge: thirtyDays,
		path: '/',
	});

	cookies.set('refresh_token', loginResponse.refresh_token, {
		expires: refreshTokenExpires,
		maxAge: thirtyDays,
		path: '/',
	});

	throw redirect(307, `/login?success=true&redirect=${redirectTo}&attempt=${attemptCount}`);
};
