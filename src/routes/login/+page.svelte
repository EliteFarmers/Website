<script lang="ts" context="module">
	throw new Error("@migration task: Check code was safely removed (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292722)");

	// import { PUBLIC_DISCORD_CLIENT_ID, PUBLIC_DISCORD_REDIRECT_URI } from '$env/static/public';
	// import { authState, authStateVal } from '$stores/auth';
	// import { browser } from '$app/env';
	// import crypto from 'crypto';

	// const endpoint = 'https://discord.com/api/oauth2/authorize'
	// 	+ '?client_id=' + PUBLIC_DISCORD_CLIENT_ID
	// 	+ '&redirect_uri=' + encodeURIComponent(PUBLIC_DISCORD_REDIRECT_URI) 
	// 	+ '&response_type=code&scope=identify%20email%20guilds';

	// export const load = async () => {
	// 	if (!browser) {
	// 		const uuid = crypto.randomUUID();
	// 		authState.set(uuid);
	// 	}

	// 	return {
	// 		redirect: endpoint ? (endpoint + `&state=${authStateVal}`) : '/',
	// 		status: 302,
	// 	}
	// }
</script>