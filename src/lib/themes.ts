import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createThemeStore() {
	const { subscribe, set } = writable<string | undefined>(undefined);

	return {
		subscribe,
		set: (theme: string) => {
			if (browser) {
				document.documentElement.className = theme;
				localStorage.setItem('theme', theme);
				set(theme);
			}
		},
		useSystem: () => {
			if (browser) {
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				const systemTheme = prefersDark ? 'dark' : 'light';
				document.documentElement.className = systemTheme;
				localStorage.removeItem('theme');
				set(systemTheme);
			}
		},
	};
}

export const themes = [
	{ name: 'Default Light', class: 'light' as const, isDark: false },
	{ name: 'Default Dark', class: 'dark' as const, isDark: true },
	{ name: 'Shallow Coast', class: 'sea' as const, isDark: false },
	{ name: 'Vampire', class: 'vampire' as const, isDark: true },
] as const;
export type ThemeClass = (typeof themes)[number]['class'];

export const currentTheme = createThemeStore();

// Initialize theme
if (browser) {
	const savedTheme = localStorage.getItem('theme');
	if (savedTheme) {
		currentTheme.set(savedTheme);
	} else {
		currentTheme.useSystem();
	}
}
