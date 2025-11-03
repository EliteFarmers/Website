import { defineConfig } from 'mdsx';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const mdsxConfig = defineConfig({
	extensions: ['.md'],
	remarkPlugins: [remarkGfm],
	rehypePlugins: [rehypeSlug, rehypePrettyCode, [rehypeGithubAlerts, { alerts: icons }]],
	blueprints: {
		default: {
			path: resolve(__dirname, './src/components/markdown/default/blueprint.svelte'),
		},
		page: {
			path: resolve(__dirname, './src/components/markdown/page/blueprint.svelte'),
		},
	},
});

const icons = [
	{ keyword: 'info', icon: '', title: 'Info' },
	{ keyword: 'todo', icon: '', title: 'Todo' },
	{ keyword: 'abstract', icon: '', title: 'Abstract' },
	{ keyword: 'summary', icon: '', title: 'Summary' },
	{ keyword: 'tldr', icon: '', title: 'Tldr' },
	{ keyword: 'tip', icon: '', title: 'Tip' },
	{ keyword: 'hint', icon: '', title: 'Hint' },
	{ keyword: 'important', icon: '', title: 'Important' },
	{ keyword: 'success', icon: '', title: 'Success' },
	{ keyword: 'check', icon: '', title: 'Check' },
	{ keyword: 'done', icon: '', title: 'Done' },
	{ keyword: 'question', icon: '', title: 'Question' },
	{ keyword: 'help', icon: '', title: 'Help' },
	{ keyword: 'faq', icon: '', title: 'Faq' },
	{ keyword: 'warning', icon: '', title: 'Warning' },
	{ keyword: 'caution', icon: '', title: 'Caution' },
	{ keyword: 'attention', icon: '', title: 'Attention' },
	{ keyword: 'fail', icon: '', title: 'Fail' },
	{ keyword: 'missing', icon: '', title: 'Missing' },
	{ keyword: 'failure', icon: '', title: 'Failure' },
	{ keyword: 'danger', icon: '', title: 'Danger' },
	{ keyword: 'error', icon: '', title: 'Error' },
	{ keyword: 'bug', icon: '', title: 'Bug' },
	{ keyword: 'example', icon: '', title: 'Example' },
	{ keyword: 'quote', icon: '', title: 'Quote' },
	{ keyword: 'cite', icon: '', title: 'Cite' },
];
