/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type PocketBase from 'pocketbase';

declare global {
	namespace App {
		interface Locals {
			discord_access_token?: string;
			discord_refresh_token?: string;
			pocketbase_token?: string;
			discordUser?: import('$db/models/users').DiscordUser | false;
			pb: PocketBase;
			userRecord: import('$db/pocketbase/pocketbase').UserRecord | null;
		}
		// interface Platform {}
		interface Session {
			discordUser: import('$db/models/users').DiscordUser | false;
			premium?: import('$lib/discord').PremiumStatus;
		}
		// interface Stuff {}
	}
}
