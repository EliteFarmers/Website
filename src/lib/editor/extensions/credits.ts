import type { CreditsEntry } from '$comp/blocks/blocks';
import CreditsNode from '$comp/editor/nodes/credits-node.svelte';
import { mergeAttributes, Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from '../svelte-node-view-renderer';

export interface CreditsOptions {
	HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		credits: {
			setCredits: (options?: { entries?: CreditsEntry[] }) => ReturnType;
		};
	}
}

export const Credits = Node.create<CreditsOptions>({
	name: 'credits',

	group: 'block',
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes() {
		return {
			entries: {
				default: [],
				parseHTML: (element) => JSON.parse(element.getAttribute('data-entries') || '[]'),
				renderHTML: (attributes) => ({
					'data-entries': JSON.stringify(attributes.entries),
				}),
			},
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="credits"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'div',
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'credits' }),
			'Credits',
		];
	},

	addCommands() {
		return {
			setCredits:
				(options = {}) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: {
							entries: options.entries || [{ username: '', reason: '' }],
						},
					});
				},
		};
	},

	addNodeView() {
		return SvelteNodeViewRenderer(CreditsNode);
	},
});
