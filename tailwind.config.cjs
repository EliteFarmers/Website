const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	mode: 'jit',
	content: ['./src/**/*.svelte'],
	darkMode: 'class',
	theme: {
		extend: {
			fontSize: {
				'body-sm': '0.6rem',
				body: '0.875rem',
				'body-lg': '1rem',
				'body-xl': '1.5rem',
			},
			colors: {
				wheat: '#d5da45',
				melon: '#bb170b',
				cactus: '#3b5b1d',
				pumpkin: '#a0560b',
				carrot: '#ff8e09',
				potato: '#e9ba62',
				sugarcane: '#82a859',
				netherwart: '#5c151a',
				mushroom: '#725643',
				cocoa: '#61381d',
			},
		},
		screens: {
			xs: '320px',
			...defaultTheme.screens,
		},
	},
};
