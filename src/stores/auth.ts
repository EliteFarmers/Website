import type { DiscordUser } from '$db/models/users';
// Svelte store for the logged in user.

import { writable } from 'svelte/store';

export const userStore = writable<DiscordUser>();

export const authState = writable<string>('');
export let authStateVal = '';

authState.subscribe((value) => (authStateVal = value));
