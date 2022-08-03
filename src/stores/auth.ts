// Svelte store for the logged in user.

import { writable } from "svelte/store";

export const userStore = writable<{
	id: string;
	name: string;
	uuid: string;
	isLoggedIn: boolean;
	isAdmin: boolean;
	isPremium: boolean;
	isBanned: boolean;
	isMuted: boolean;
}>({ id: '', name: '', uuid: '', isLoggedIn: false, isAdmin: false, isPremium: false, isBanned: false, isMuted: false });

export const authState = writable<string>('');
export let authStateVal = '';

authState.subscribe(value => authStateVal = value);