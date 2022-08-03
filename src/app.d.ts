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
		user: false | User 
	}
	// interface Stuff {}
}

type User = {
	id: string;
	username: string;
	discriminator: string;
	avatar: string;
	avatar_decoration?: string | null;
	email: string;
	verified: boolean;
	bot: boolean;
	mfa_enabled: boolean;
	locale: string;
	premium_type?: string;
	public_flags: number;
	flags: number;
	premium_since?: string;
	banner?: string | null;
	banner_color?: string | null;
	accent_color?: string | null;
}