import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
// import atImport from 'postcss-import';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

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
			'$stores': './src/stores',
			'$lib': './src/lib',
			'$params': './src/params',
		}
	},
};

export default config;
