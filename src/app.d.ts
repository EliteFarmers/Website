/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { AuthorizedUser } from '$lib/eliteapi/eliteapi';

declare global {
	declare namespace App {
		interface Locals {
			discord_access_token?: string;
			discord_refresh_token?: string;
			user?: AuthorizedUser;
		}
		// interface Platform {}
		interface Session {
			user?: AuthorizedUser;
			premium?: import('$lib/discord').PremiumStatus;
		}
		// interface Stuff {}
	}
}
