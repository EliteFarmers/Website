import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import path from 'path';
import { defineConfig, type PluginOption } from 'vite';

const plugins = [
	process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
		? sentrySvelteKit({
				org: 'kaeso',
				project: 'elite-website',
				authToken: process.env.SENTRY_AUTH_TOKEN,
			})
		: null,
	tailwindcss(),
	sveltekit(),
];

const __dirname = fileURLToPath(new URL('.', import.meta.url));
export const veliteDirPath = path.join(__dirname, '.velite');

export default defineConfig({
	plugins: plugins.filter((p) => p !== null) as PluginOption[],
	optimizeDeps: {
		exclude: ['@napi-rs/canvas', 'isomorphic-dompurify', 'farming-weight'],
	},
	ssr: {
		noExternal: ['farming-weight'],
	},
	server: {
		allowedHosts: ['.elitebot.dev', '.kaeso.dev', '.eliteskyblock.com'],
		fs: {
			allow: [veliteDirPath, path.resolve(__dirname, 'packages')],
		},
	},
	preview: {
		port: 5173,
	},
	resolve: {
		alias: {
			$ui: path.resolve('./src/components/ui'),
			$comp: path.resolve('./src/components'),
			$stores: path.resolve('./src/stores'),
			$db: path.resolve('./src/database'),
			$lib: path.resolve('./src/lib'),
			$params: path.resolve('./src/params'),
			'farming-weight': path.resolve(__dirname, 'packages/farming-weight/src'),
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
