/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
	interface Locals {
		discord_access_token?: string;
		discord_refresh_token?: string;
	}
	// interface Platform {}
	interface Session {
		discordUser: import('$db/models/users').DiscordUser | false;
		user: import('$db/models/users').User | false;
	}
	// interface Stuff {}
}