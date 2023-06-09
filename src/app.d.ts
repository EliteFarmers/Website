/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { DiscordUser } from '$db/models/users';

declare global {
	namespace App {
		interface Locals {
			discord_access_token?: string;
			discord_refresh_token?: string;
			discordUser?: DiscordUser;
		}
		// interface Platform {}
		interface Session {
			discordUser: DiscordUser;
			premium?: import('$lib/discord').PremiumStatus;
		}
		// interface Stuff {}
	}
}
