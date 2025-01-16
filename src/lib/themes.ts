import Moon from 'lucide-svelte/icons/moon';
import Sun from 'lucide-svelte/icons/sun';

export const themes = [
	{ name: 'Default Light', class: 'light' as const, isDark: false },
	{ name: 'Default Dark', class: 'dark' as const, isDark: true },
	{ name: 'Shallow Coast', class: 'sea' as const, isDark: false },
	{ name: "Vampire", class: 'vampire' as const, isDark: true },
] as const;

export type ThemeClass = (typeof themes)[number]['class'];
