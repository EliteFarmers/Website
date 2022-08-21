import { PUBLIC_DISCORD_CLIENT_ID, PUBLIC_DISCORD_REDIRECT_URI } from '$env/static/public';
import { authState, authStateVal } from '$stores/auth';
import { browser } from '$app/env';
import crypto from 'crypto';
import { redirect } from '@sveltejs/kit';
import { goto } from '$app/navigation';

const endpoint = 'https://discord.com/api/oauth2/authorize'
	+ '?client_id=' + PUBLIC_DISCORD_CLIENT_ID
	+ '&redirect_uri=' + encodeURIComponent(PUBLIC_DISCORD_REDIRECT_URI) 
	+ '&response_type=code&scope=identify%20email%20guilds';

export const load = async () => {
	if (!browser) {
		const uuid = crypto.randomUUID();
		authState.set(uuid);
	}
	
	// Hacky fix for https://github.com/sveltejs/kit/issues/5952
	const location = endpoint ? (endpoint + `&state=${authStateVal}`) : '/';
	if (browser) {
		return await goto(location);
	} else throw redirect(302, location);
}