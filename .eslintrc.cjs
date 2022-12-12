module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:@typescript-eslint/strict',
		'prettier',
	],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		project: ['tsconfig.json'],
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	rules: {
		eqeqeq: 'warn',
		importsNotUsedAsValues: 'off',
		noThrowLiteral: 'off',
		'@typescript-eslint/no-throw-literal': 'off',
	},
};
