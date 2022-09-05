import { PUBLIC_DISCORD_CLIENT_ID, PUBLIC_DISCORD_REDIRECT_URI } from '$env/static/public';
import { authState, authStateVal } from '$stores/auth';
import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import crypto from 'crypto';

const endpoint = 'https://discord.com/api/oauth2/authorize'
	+ '?client_id=' + PUBLIC_DISCORD_CLIENT_ID
	+ '&redirect_uri=' + encodeURIComponent(PUBLIC_DISCORD_REDIRECT_URI) 
	+ '&response_type=code&scope=identify%20email%20guilds';

export const load = () => {
	if (!browser) {
		const uuid = crypto.randomUUID();
		authState.set(uuid);
	}
	
	const location = endpoint ? (endpoint + `&state=${authStateVal}`) : '/';
	throw redirect(302, location);
}