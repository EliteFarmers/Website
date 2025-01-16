/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { AuthSession } from '$lib/api/auth';
import type { AuthorizedUser } from '$lib/api/elite';
import type { ThemeClass } from '$lib/themes';

declare global {
	declare namespace App {
		interface Locals {
			access_token?: string;
			refresh_token?: string;
			user?: AuthorizedUser;
			session?: AuthSession;
		}
		// interface Platform {}
		interface Session {
			session?: AuthSession;
		}
		// interface Stuff {}
	}
}

declare module 'svelte-ux' {
	interface ThemeConfig {
		[K in ThemeClass]?: string[];
	}
}

declare module 'mode-watcher' {
	export function setMode(mode: ThemeClass | 'system'): void;
}
