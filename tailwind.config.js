import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/layerchart/**/*.{svelte,js}'],
	safelist: ['dark'],
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
		},
	},
};

export default config;
