import { writable } from 'svelte/store';

const storedKey = globalThis.localStorage.getItem('key') ?? '';
const isValidated = globalThis.localStorage.getItem('validated') === 'true';

export const keyStore = writable<{ key: string; validated: boolean }>({
	key: storedKey,
	validated: isValidated,
});

keyStore.subscribe((value) => {
	globalThis.localStorage.setItem('key', value.key);
	globalThis.localStorage.setItem('validated', value.validated ? 'true' : 'false');
});
