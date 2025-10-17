import { PUBLIC_DISCORD_REDIRECT_ROUTE } from '$env/static/public';
import { getAcceptConfirmationUrl, login } from '$lib/api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies }) => {
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

		error(400, errorMsg);
	}

	if (!code || !state || !storedState || !state.startsWith(storedState)) {
		error(400, "Couldn't verify your request, please try again.");
	}

	const [, redirectTo = '', attemptCount = 0, acceptConfirmation = ''] = state.split('|');

	const {
		data: loginResponse,
		response: r,
		error: e,
	} = await login({
		code: code,
		redirect_uri: url.origin + PUBLIC_DISCORD_REDIRECT_ROUTE,
	});

	if (!loginResponse) {
		console.log(r);
		console.log(e);
		error(500, 'Failed to login user!');
	}

	const thirtyDays = 30 * 24 * 60 * 60;
	const refreshTokenExpires = new Date(Date.now() + thirtyDays * 1000); // 30 days

	console.log('Accept Confirmation:', acceptConfirmation);
	console.log('Pending Confirmation:', loginResponse.pending_confirmation);

	if (
		acceptConfirmation &&
		loginResponse.pending_confirmation &&
		loginResponse.pending_confirmation.id === +acceptConfirmation
	) {
		const response = await fetch(getAcceptConfirmationUrl(acceptConfirmation), {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${loginResponse.access_token}`,
				'Content-Type': 'application/json',
			},
		}).then((res) => res.json());

		if (!response.ok) {
			console.error('Failed to accept confirmation automatically:', response);
		} else {
			// If successful, clear the pending confirmation so we don't redirect to it
			loginResponse.pending_confirmation = null;
		}
	}

	if (loginResponse.pending_confirmation) {
		throw redirect(
			307,
			`/login/confirm?id=${loginResponse.pending_confirmation.id}&redirect=${redirectTo}&attempt=${attemptCount}`
		);
	}

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

	redirect(307, `/login?success=true&redirect=${redirectTo}&attempt=${attemptCount}`);
};
