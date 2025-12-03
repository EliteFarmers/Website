import { PUBLIC_DISCORD_CLIENT_ID, PUBLIC_DISCORD_REDIRECT_ROUTE } from '$env/static/public';
import { getAuthAccount } from '$lib/api';
import { error, redirect } from '@sveltejs/kit';
import crypto from 'crypto';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url, locals }) => {
	const success = url.searchParams.get('success');
	const redirectTo = url.searchParams.get('redirect');
	const attemptCount = url.searchParams.get('attempt');
	const accept = url.searchParams.get('accept');
	const firstLogin = url.searchParams.get('first');

	if (success) {
		if (attemptCount && +attemptCount > 3) {
			error(500, 'Login failed too many times! Please try again later.');
		}

		const { data: auth } = locals.access_token ? await getAuthAccount() : { data: null };

		if (redirectTo) {
			return {
				firstLogin: firstLogin === 'true',
				redirect: decodeURIComponent(redirectTo),
				user: auth,
			};
		}

		return {
			firstLogin: firstLogin === 'true',
			user: auth,
		};
	}

	const uuid = crypto.randomUUID();

	const endpoint =
		'https://discord.com/api/oauth2/authorize' +
		`?client_id=${PUBLIC_DISCORD_CLIENT_ID}` +
		'&redirect_uri=' +
		encodeURIComponent(`${url.origin}${PUBLIC_DISCORD_REDIRECT_ROUTE}`) +
		'&response_type=code&scope=identify%20guilds%20role_connections.write' +
		`&state=${uuid}|${encodeURIComponent(redirectTo ?? '/profile')}|${attemptCount ?? 0}|${accept ?? ''}` +
		`&prompt=${attemptCount ? 'consent' : 'none'}`;

	cookies.set('auth_state', uuid, {
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	});

	throw redirect(303, endpoint);
};
