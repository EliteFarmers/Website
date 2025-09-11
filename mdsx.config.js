import { defineConfig } from 'mdsx';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const mdsxConfig = defineConfig({
	extensions: ['.md'],
	remarkPlugins: [remarkGfm],
	rehypePlugins: [rehypeSlug, rehypePrettyCode],
	blueprints: {
		default: {
			path: resolve(__dirname, './src/components/markdown/default/blueprint.svelte'),
		},
		page: {
			path: resolve(__dirname, './src/components/markdown/page/blueprint.svelte'),
		},
	},
});
