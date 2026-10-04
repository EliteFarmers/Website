import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteControlFlowNewline from './eslint-rules/svelte-control-flow-newline.js';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
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
			'*.ts',
		],
	},
	{
		files: ['**/*.svelte'],
		plugins: {
			local: {
				rules: {
					'svelte-control-flow-newline': svelteControlFlowNewline,
				},
			},
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
			},
		},
		rules: {
			'local/svelte-control-flow-newline': 'error',
			'svelte/no-navigation-without-resolve': 'off', // To be fixed later
			'svelte/no-unused-svelte-ignore': 'off',
			'no-undef': 'off', // TypeScript checks for this already
			'no-restricted-imports': [
				'error',
				{
					patterns: ['farming-weight/dist/*'],
				},
			],
			'no-useless-assignment': 'off', // False positives with bindable
		},
	}
);
