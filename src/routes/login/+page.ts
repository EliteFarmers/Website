import { PUBLIC_DISCORD_CLIENT_ID as CLIENT_ID, PUBLIC_DISCORD_REDIRECT_ROUTE } from '$env/static/public';
import { authState, authStateVal } from '$stores/auth';
import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { invalidateAll } from '$app/navigation';
import crypto from 'crypto';

import type { PageLoad } from './$types';
export const load: PageLoad = async ({ url }) => {
	const success = url.searchParams.get('success');

	if (!browser && !success) {
		const uuid = crypto.randomUUID();
		authState.set(uuid);

		const endpoint =
			'https://discord.com/api/oauth2/authorize' +
			`?client_id=${CLIENT_ID}` +
			'&redirect_uri=' +
			encodeURIComponent(url.origin + PUBLIC_DISCORD_REDIRECT_ROUTE) +
			'&response_type=code&scope=identify%20guilds' +
			`&state=${authStateVal}`;

		throw redirect(303, endpoint);
	}

	if (success && browser) {
		await invalidateAll();
	}

	throw redirect(303, '/');
};
