import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$comp: path.resolve('./src/components'),
			$stores: path.resolve('./src/stores'),
			$lib: path.resolve('./src/lib')
		}
	}
};

export default config;