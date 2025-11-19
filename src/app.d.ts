/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { AuthorizedAccountDto } from '$lib/api';
import type { AuthSession } from '$lib/api/auth';

declare global {
	declare namespace App {
		interface Locals {
			access_token?: string;
			refresh_token?: string;
			user?: AuthorizedAccountDto;
			session?: AuthSession;
			persistSession?: boolean;
			cache?: typeof import('$lib/servercache').cache;
			bot: boolean;
			ads: boolean;
		}
		// interface Platform {}
		interface Session {
			session?: AuthSession;
		}
		interface PageData {
			session?: AuthSession;
			bot: boolean;
			ads: boolean;
		}
		// interface Stuff {}
	}

	declare interface Window {
		gtag: (...args: unknown[]) => void;
		updateGtagConsent: () => void;
		nitroAds: {
			createAd: (id: string, settings: Record<string, unknown>) => void;
			removeAd: (id: string) => void;
		};
		[key: string]: unknown;
	}
}
