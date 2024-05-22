/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { components } from '$lib/api/api';
import type { AuthorizedUser, UserInfo } from '$lib/api/elite';

declare global {
	declare namespace App {
		interface Locals {
			access_token?: string;
			refresh_token?: string;
			user?: AuthorizedUser;
			userInfo?: UserInfo;
			session?: components['schemas']['AuthSessionDto'];
		}
		// interface Platform {}
		interface Session {
			userInfo?: UserInfo;
			session?: components['schemas']['AuthSessionDto'];
		}

		interface PageData {
			userInfo?: UserInfo;
		}
		// interface Stuff {}
	}
}
