import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$comp: path.resolve('./src/components'),
			$stores: path.resolve('./src/stores'),
			$db: path.resolve('./src/database'),
			$lib: path.resolve('./src/lib'),
			$params: path.resolve('./src/params'),
		},
	},
};

export default config;
