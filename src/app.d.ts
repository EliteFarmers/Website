/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { AuthSession } from '$lib/api/auth';
import type { AuthorizedUser } from '$lib/api/elite';

declare global {
	declare namespace App {
		interface Locals {
			access_token?: string;
			refresh_token?: string;
			user?: AuthorizedUser;
			session?: AuthSession;
			cache?: typeof import('$lib/servercache').cache;
		}
		// interface Platform {}
		interface Session {
			session?: AuthSession;
		}
		// interface Stuff {}
	}
}
