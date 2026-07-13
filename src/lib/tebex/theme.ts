import { browser } from '$app/environment';
import { themes } from '$lib/stores/themes.svelte';
import type { PortalOptions, TebexTheme } from '@tebexio/tebex.js';

function hslToHex(h: number, s: number, l: number): string {
	l /= 100;
	const a = (s / 100) * Math.min(l, 1 - l);
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color)
			.toString(16)
			.padStart(2, '0');
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}

function getCssVarHex(varName: string): string | null {
	const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
	// Handle both space-separated hsl(240 5.9% 10%) and comma-separated hsl(153, 57%, 60%)
	const match = value.match(/hsl\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%\s*\)/);
	if (!match) return null;
	return hslToHex(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
}

export function getTebexThemeConfig(): {
	theme: TebexTheme;
	colors: NonNullable<PortalOptions['colors']>;
} {
	if (!browser) return { theme: 'light', colors: {} };

	const currentTheme = document.documentElement.className.trim();
	const isDark = themes.find((t) => t.class === currentTheme)?.isDark ?? false;
	const primary = getCssVarHex('--accent-green') ?? '#66c9a2';
	const secondary = getCssVarHex('--primary') ?? (isDark ? '#fafafa' : '#19191b');

	return {
		theme: isDark ? 'dark' : 'light',
		colors: { primary, secondary },
	};
}
