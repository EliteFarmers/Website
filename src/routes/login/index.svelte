<script lang="ts" context="module">
	import { PUBLIC_DISCORD_CLIENT_ID, PUBLIC_DISCORD_REDIRECT_URI } from '$env/static/public';
	import { authState, authStateVal } from '$stores/auth';
	import { prerendering } from "$app/env";
	import crypto from 'crypto';

	const uuid = crypto.randomUUID();

	const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(PUBLIC_DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email%20guilds`;

	export const load = async () => {
		authState.set(uuid);

		return {
			redirect: DISCORD_ENDPOINT + `&state=${uuid}`,
			status: 302,
		}
	}
</script>