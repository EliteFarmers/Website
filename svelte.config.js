import adapter from '@sveltejs/adapter-node';
import { sveltePreprocess } from 'svelte-preprocess';
// import atImport from 'postcss-import';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: sveltePreprocess(),

	kit: {
		adapter: adapter({
			precompress: true,
		}),
		env: {
			dir: path.resolve('./'),
			publicPrefix: 'PUBLIC_',
		},
		csp: {
			mode: 'hash',
		},
		csrf: {
			// Only disable if in development mode
			checkOrigin: process.env.NODE_ENV !== 'development',
		},
		alias: {
			'$comp': './src/components',
			'$ui': './src/components/ui',
			'$stores': './src/stores',
			'$lib': './src/lib',
			'$params': './src/params',
			'$content': './src/content',
		},
	},
	// Only way I found to hide warnings from node_modules that doesn't break everything
	// vitePlugin: { exclude: ['**/node_modules/**'] } doesn't work  
	onwarn: (warning, handler) => {
		if (warning.filename.includes('node_modules')) return;
		handler(warning);
	},
};

export default config;
