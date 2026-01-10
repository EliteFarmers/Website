import SkyblockItemNode from '$comp/editor/nodes/skyblock-item-node.svelte';
import { mergeAttributes, Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from '../svelte-node-view-renderer';

export interface SkyblockItemOptions {
	HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		skyblockItem: {
			setSkyblockItem: (options: {
				skyblockId: string;
				size?: 'sm' | 'md' | 'lg';
				inline?: boolean;
			}) => ReturnType;
		};
	}
}

export const SkyblockItem = Node.create<SkyblockItemOptions>({
	name: 'skyblockItem',

	group: 'inline',
	inline: true,
	atom: true, // Leaf node, no editable content inside

	draggable: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes() {
		return {
			skyblockId: {
				default: null,
				parseHTML: (element) => element.getAttribute('data-skyblock-id'),
				renderHTML: (attributes) => {
					return {
						'data-skyblock-id': attributes.skyblockId,
					};
				},
			},
			size: {
				default: 'md',
				parseHTML: (element) => element.getAttribute('data-size'),
				renderHTML: (attributes) => {
					return {
						'data-size': attributes.size,
					};
				},
			},
			inline: {
				default: true, // Default to inline? User requested "Inline" option.
				parseHTML: (element) => element.getAttribute('data-inline') === 'true',
				renderHTML: (attributes) => {
					return {
						'data-inline': attributes.inline,
					};
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: 'span[data-type="skyblock-item"]',
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'span',
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'skyblock-item' }),
			0,
		];
	},

	addCommands() {
		return {
			setSkyblockItem:
				(options) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: options,
					});
				},
		};
	},

	addNodeView() {
		return SvelteNodeViewRenderer(SkyblockItemNode);
	},
});
