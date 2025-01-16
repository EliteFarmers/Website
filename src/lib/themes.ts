import Moon from 'lucide-svelte/icons/moon';
import Sun from 'lucide-svelte/icons/sun';

export const themes = [
	{ name: 'Default Light', class: 'light', icon: Sun },
	{ name: 'Default Dark', class: 'dark', icon: Moon },
] as const;
