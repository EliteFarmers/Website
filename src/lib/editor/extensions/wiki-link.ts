import WikiLinkNode from '$comp/editor/nodes/wiki-link-node.svelte';
import { normalizeWikiLinkUrl } from '$lib/guides/wiki-links';
import { mergeAttributes, Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from '../svelte-node-view-renderer';

export interface WikiLinkOptions {
	HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		wikiLink: {
			setWikiLink: (options: { url: string; pageName?: string }) => ReturnType;
		};
	}
}

export const WikiLink = Node.create<WikiLinkOptions>({
	name: 'wikiLink',

	group: 'inline',
	inline: true,
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes() {
		return {
			url: {
				default: '',
				parseHTML: (element) => element.getAttribute('href') || element.getAttribute('data-url') || '',
				renderHTML: (attributes) => ({
					'data-url': attributes.url,
				}),
			},
			pageName: {
				default: '',
				parseHTML: (element) => element.getAttribute('data-page-name') || '',
				renderHTML: (attributes) => ({
					'data-page-name': attributes.pageName,
				}),
			},
		};
	},

	parseHTML() {
		return [{ tag: 'a[data-type="wiki-link"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'a',
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				'data-type': 'wiki-link',
				href: HTMLAttributes.url,
			}),
			HTMLAttributes.pageName || 'Wiki link',
		];
	},

	addCommands() {
		return {
			setWikiLink:
				(options) =>
				({ commands }) => {
					const normalized = normalizeWikiLinkUrl(options.url);
					if (!normalized) return false;

					return commands.insertContent([
						{
							type: this.name,
							attrs: {
								url: normalized.url,
								pageName: options.pageName || normalized.pageName,
							},
						},
						{ type: 'text', text: ' ' },
					]);
				},
		};
	},

	addNodeView() {
		return SvelteNodeViewRenderer(WikiLinkNode);
	},
});
