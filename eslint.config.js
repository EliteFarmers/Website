import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig,
			},
		},
		rules: {
			'svelte/no-navigation-without-resolve': 'off', // To be fixed later
		},
	},
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'src/lib/api/client/',
			'src/lib/api/schemas/',
			'node_modules',
			'static',
			'.velite',
			'packages/',
		],
	},
	{
		files: ['**/*.ts', '**/*.svelte'],
		rules: {
			'no-undef': 'off', // TypeScript checks for this already
		},
	}
);
