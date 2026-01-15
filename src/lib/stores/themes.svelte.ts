import { browser } from '$app/environment';
import { PersistedState } from 'runed';
import { getContext, setContext } from 'svelte';

export class Theme {
	#theme = new PersistedState('theme', '', {
		serializer: {
			serialize: (value) => value,
			deserialize: (value) => value,
		},
	});

	constructor() {
		$effect.pre(() => {
			document.documentElement.className = this.theme;
		});
	}

	get theme() {
		if (this.#theme.current === '' || !this.#theme.current) {
			this.useSystem();
		}
		return this.#theme.current ?? 'light';
	}

	set theme(value: string) {
		this.#theme.current = value;
		document.documentElement.className = value;
	}

	useSystem() {
		if (!browser) return;
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const systemTheme = prefersDark ? 'dark' : 'light';
		this.theme = systemTheme;
	}
}

export interface ThemeInfo {
	name: string;
	class: string;
	isDark: boolean;
}

export const themes = [
	{ name: 'Light', class: 'light' as const, isDark: false },
	{ name: 'Dark', class: 'dark' as const, isDark: true },
	{ name: 'Shallow Coast', class: 'sea' as const, isDark: false },
	{ name: 'Vampire', class: 'vampire' as const, isDark: true },
	{ name: 'Retro Light', class: 'retro-light' as const, isDark: false },
	{ name: 'Retro Dark', class: 'retro-dark' as const, isDark: true },
] satisfies ThemeInfo[];
export type ThemeClass = (typeof themes)[number]['class'];

export function initThemeContext() {
	const existing = getContext<Theme>('theme');
	if (existing) {
		return existing;
	}

	const stats = new Theme();
	setContext('theme', stats);
	return stats;
}

export function getThemeContext() {
	const stats = getContext<Theme>('theme');
	if (!stats) {
		throw new Error('Theme context not found');
	}
	return stats;
}
