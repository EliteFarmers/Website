import { writable } from 'svelte/store';

export enum Theme {
	Light = 'light',
	Dark = 'dark',
	Unset = 'unset',
}

export const themeStore = writable<Theme>(Theme.Unset);

export function swapTheme() {
	themeStore.update((theme) => {
		switch (theme) {
			case Theme.Light:
				return Theme.Dark;
			case Theme.Dark:
				return Theme.Light;
			default:
				return Theme.Dark;
		}
	});
}
