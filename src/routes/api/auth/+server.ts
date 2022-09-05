import { env } from '$env/dynamic/public';
import { authState } from '$stores/auth';
import crypto from 'crypto';

const DISCORD_CLIENT_ID = env.PUBLIC_DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = env.PUBLIC_DISCORD_REDIRECT_URI;
const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email%20guilds`;
 
export function GET() {
	const uuid = crypto.randomUUID();
	authState.set(uuid);

	return new Response(undefined, {
		status: 302,
		headers: {
			'Location': DISCORD_ENDPOINT + `&state=${uuid}`
		}
	})
}