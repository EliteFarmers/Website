import { PUBLIC_DISCORD_REDIRECT_ROUTE, PUBLIC_DISCORD_CLIENT_ID } from '$env/static/public';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import crypto from 'crypto';

export const load: PageServerLoad = ({ cookies, url }) => {
	const success = url.searchParams.get('success');
	const redirectTo = url.searchParams.get('redirect');

	if (success) {
		if (redirectTo) {
			throw redirect(307, decodeURIComponent(redirectTo));
		}

		return {
			success: true,
		};
	}

	const uuid = crypto.randomUUID();

	const endpoint =
		'https://discord.com/api/oauth2/authorize' +
		`?client_id=${PUBLIC_DISCORD_CLIENT_ID}` +
		'&redirect_uri=' +
		encodeURIComponent(`${url.origin}${PUBLIC_DISCORD_REDIRECT_ROUTE}`) +
		'&response_type=code&scope=identify%20guilds%20role_connections.write' +
		`&state=${uuid}|${encodeURIComponent(redirectTo ?? '/profile')}`;

	cookies.set('auth_state', uuid, {
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	});

	throw redirect(303, endpoint);
};
