<script lang="ts">
	import { MINECRAFT_COLORS, type ColorCode } from '$lib/constants/colors';

	interface Props {
		tag: string;
		tagColor?: string | null;
		class?: string;
	}

	let { tag, tagColor, class: className = '' }: Props = $props();

	const FALLBACK_TAG_BACKGROUND = '#1F2937';

	const HYPIXEL_COLOR_NAMES: Record<string, string> = {
		BLACK: '#000000',
		DARK_BLUE: '#0000AA',
		DARK_GREEN: '#00AA00',
		DARK_AQUA: '#00AAAA',
		DARK_RED: '#AA0000',
		DARK_PURPLE: '#AA00AA',
		GOLD: '#FFAA00',
		GRAY: '#AAAAAA',
		DARK_GRAY: '#555555',
		BLUE: '#5555FF',
		GREEN: '#55FF55',
		AQUA: '#55FFFF',
		RED: '#FF5555',
		LIGHT_PURPLE: '#FF55FF',
		YELLOW: '#FFFF55',
		WHITE: '#FFFFFF',
	};

	const resolvedColor = $derived(resolveTagColor(tagColor));
	const backgroundColor = $derived(adjustGuildTagColor(resolvedColor));
	const borderColor = $derived(lightenHex(backgroundColor, 1.1));

	function resolveTagColor(raw?: string | null) {
		if (!raw) return undefined;
		const color = raw.trim();
		if (!color) return undefined;

		if (color.startsWith('#')) return normalizeHex(color);

		if (color.startsWith('&') || color.startsWith('§')) {
			const key = `§${color.slice(1).toLowerCase()}` as ColorCode;
			return MINECRAFT_COLORS[key];
		}

		return normalizeHex(color) ?? normalizeHex(HYPIXEL_COLOR_NAMES[color.toUpperCase()]);
	}

	function adjustGuildTagColor(hex?: string | null) {
		const normalized = normalizeHex(hex ?? '');
		if (!normalized) return FALLBACK_TAG_BACKGROUND;
		const { r, g, b } = hexToRgb(normalized);
		const luminance = getRelativeLuminance(r, g, b);
		if (luminance > 0.6) {
			return rgbToHex({
				r: Math.round(r * 0.55),
				g: Math.round(g * 0.55),
				b: Math.round(b * 0.55),
			});
		}
		if (luminance < 0.15) {
			return rgbToHex({
				r: clamp(Math.round(r * 1.25 + 18), 0, 255),
				g: clamp(Math.round(g * 1.25 + 18), 0, 255),
				b: clamp(Math.round(b * 1.25 + 18), 0, 255),
			});
		}
		return normalized;
	}

	function lightenHex(hex: string, factor = 1.1) {
		const normalized = normalizeHex(hex);
		if (!normalized) return '#FFFFFF';
		const { r, g, b } = hexToRgb(normalized);
		return rgbToHex({
			r: clamp(Math.round(r * factor), 0, 255),
			g: clamp(Math.round(g * factor), 0, 255),
			b: clamp(Math.round(b * factor), 0, 255),
		});
	}

	function normalizeHex(hex?: string | null) {
		if (!hex) return undefined;
		const value = hex.startsWith('#') ? hex.slice(1) : hex;
		if (value.length === 3) {
			return `#${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`.toUpperCase();
		}
		if (value.length === 6) {
			return `#${value.toUpperCase()}`;
		}
		return undefined;
	}

	function hexToRgb(hex: string) {
		const value = hex.replace('#', '');
		const num = parseInt(value, 16);
		return {
			r: (num >> 16) & 0xff,
			g: (num >> 8) & 0xff,
			b: num & 0xff,
		};
	}

	function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
		return `#${clamp(r, 0, 255).toString(16).padStart(2, '0')}${clamp(g, 0, 255)
			.toString(16)
			.padStart(2, '0')}${clamp(b, 0, 255).toString(16).padStart(2, '0')}`.toUpperCase();
	}

	function getRelativeLuminance(r: number, g: number, b: number) {
		return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}
</script>

<span
	class={`inline-flex min-w-10 items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold tracking-[0.08em] text-white uppercase shadow-[0px_2px_6px_rgba(0,0,0,0.35)] [text-shadow:0_1px_2px_rgba(0,0,0,0.55)] ${className}`.trim()}
	style:background-color={backgroundColor}
	style:border-color={borderColor}
>
	{tag}
</span>
