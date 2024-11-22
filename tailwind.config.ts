import { fontFamily } from 'tailwindcss/defaultTheme';
import colors from 'tailwindcss/colors';
import tailwindcssAnimate from 'tailwindcss-animate';
import svelteUx from 'svelte-ux/plugins/tailwind.cjs';
import { Config } from 'tailwindcss';

export default {
	darkMode: ['class'],
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/layerchart/**/*.{svelte,js}',
		'./node_modules/svelte-ux/**/*.{svelte,js}',
	],
	safelist: ['dark'],
	plugins: [svelteUx({ colorSpace: 'oklch' }), tailwindcssAnimate],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
				},
				wheat: {
					DEFAULT: 'hsl(var(--wheat) / <alpha-value>)',
				},
				melon: {
					DEFAULT: 'hsl(var(--melon) / <alpha-value>)',
				},
				cactus: {
					DEFAULT: 'hsl(var(--cactus) / <alpha-value>)',
				},
				pumpkin: {
					DEFAULT: 'hsl(var(--pumpkin) / <alpha-value>)',
				},
				carrot: {
					DEFAULT: 'hsl(var(--carrot) / <alpha-value>)',
				},
				potato: {
					DEFAULT: 'hsl(var(--potato) / <alpha-value>)',
				},
				sugarcane: {
					DEFAULT: 'hsl(var(--sugarcane) / <alpha-value>)',
				},
				netherwart: {
					DEFAULT: 'hsl(var(--netherwart) / <alpha-value>)',
				},
				mushroom: {
					DEFAULT: 'hsl(var(--mushroom) / <alpha-value>)',
				},
				cocoa: {
					DEFAULT: 'hsl(var(--cocoa) / <alpha-value>)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			fontFamily: {
				sans: [...fontFamily.sans],
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'caret-blink': {
					'0%,70%,100%': { opacity: '1' },
					'20%,50%': { opacity: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'caret-blink': 'caret-blink 1.25s ease-out infinite',
			},
		},
	},
	ux: {
		themes: {
			light: {
				accent: 'black',
				primary: colors['orange']['500'],
				'primary-content': 'black',
				secondary: colors['blue']['500'],
				'surface-100': colors['gray']['100'],
				'surface-200': colors['gray']['400'],
				'surface-300': colors['gray']['500'],
				'surface-content': 'black',
				'color-scheme': 'light',
			},
			dark: {
				accent: 'white',
				primary: colors['orange']['500'],
				'primary-content': 'white',
				secondary: colors['blue']['500'],
				'surface-100': 'white',
				'surface-200': colors['zinc']['900'],
				'surface-300': colors['zinc']['950'],
				'surface-content': colors['zinc']['100'],
				'color-scheme': 'dark',
			},
		},
	},
} satisfies Config;
