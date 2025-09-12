import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
		exclude: ['@napi-rs/canvas', 'isomorphic-dompurify'],
	},
	resolve: {
		alias: {
			$ui: path.resolve('./src/components/ui'),
			$comp: path.resolve('./src/components'),
			$stores: path.resolve('./src/stores'),
			$db: path.resolve('./src/database'),
			$lib: path.resolve('./src/lib'),
			$params: path.resolve('./src/params'),
		},
	},
	build: {
		sourcemap: true,
		commonjsOptions: {
			ignore: [
				'@napi-rs/canvas-*',
				'@napi-rs/canvas-darwin-arm64',
				'@napi-rs/canvas-darwin-x64',
				'@napi-rs/canvas-linux-arm64-gnu',
				'@napi-rs/canvas-linux-arm64-musl',
				'@napi-rs/canvas-linux-x64-gnu',
				'@napi-rs/canvas-linux-x64-musl',
				'@napi-rs/canvas-win32-x64-msvc',
			],
		},
	},
});
