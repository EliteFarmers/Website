import { env } from '$env/dynamic/public';
const { PUBLIC_DISCORD_REDIRECT_ROUTE } = env;
import { acceptConfirmation as acceptLoginConfirmation, login } from '$lib/api';
import { IsAuthTokenResponse, UpdateAuthCookies } from '$lib/api/auth';
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

	const result = await login({
		code: code,
		redirect_uri: url.origin + PUBLIC_DISCORD_REDIRECT_ROUTE,
	}).catch(() => undefined);

	if (!result?.ok || result.response.status !== 200 || !IsAuthTokenResponse(result.data)) {
		error(500, 'Failed to login user!');
	}
	const loginResponse = result.data;
	UpdateAuthCookies(cookies, loginResponse);

	if (
		acceptConfirmation &&
		loginResponse.pending_confirmation &&
		loginResponse.pending_confirmation.id === +acceptConfirmation
	) {
		const response = await acceptLoginConfirmation(acceptConfirmation, {
			headers: { Authorization: `Bearer ${loginResponse.access_token}` },
		}).catch(() => undefined);
		if (response?.ok) {
			// If successful, clear the pending confirmation so we don't redirect to it
			loginResponse.pending_confirmation = null;
		}
	}

	const first = loginResponse.first_login ? '&first=true' : '';

	if (loginResponse.pending_confirmation) {
		throw redirect(
			307,
			`/login/confirm?id=${loginResponse.pending_confirmation.id}&redirect=${redirectTo}&attempt=${attemptCount}${first}`
		);
	}

	redirect(307, `/login?success=true&redirect=${redirectTo}&attempt=${attemptCount}${first}`);
};
