/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { AuthorizedUser, UserInfo } from '$lib/api/elite';

declare global {
	declare namespace App {
		interface Locals {
			discord_access_token?: string;
			discord_refresh_token?: string;
			user?: AuthorizedUser;
			userInfo?: UserInfo;
		}
		// interface Platform {}
		interface Session {
			userInfo?: UserInfo;
		}

		interface PageData {
			userInfo?: UserInfo;
		}
		// interface Stuff {}
	}
}
