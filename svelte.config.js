import adapter from '@sveltejs/adapter-node';
import { mdsx } from 'mdsx';
import path from 'path';
import { mdsxConfig } from './mdsx.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [mdsx(mdsxConfig)],
	compilerOptions: {
		experimental: {
			// async: true, // Soon hopefully
		},
	},
    extensions: ['.svelte', '.md'],
	kit: {
		experimental: {
			remoteFunctions: true,
		},
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
			$ui: './src/components/ui',
			$comp: './src/components',
			$stores: './src/stores',
			$lib: './src/lib',
			$params: './src/params',
			$content: './src/content',
			$css: './src/app.css',
            '$posts/*': '.velite/*'
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
