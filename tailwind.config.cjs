const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	mode: 'jit',
	content: ['./src/**/*.svelte'],
	theme: {
		extend: {
			fontSize: {
				'body-sm': '0.6rem',
				'body': '0.875rem',
				'body-lg': '1rem',
				'body-xl': '1.5rem',
			},
		},
		screens: {
			'xs': '320px',
			...defaultTheme.screens,
		},
	}
};
