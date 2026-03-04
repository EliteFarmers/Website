import type { ItemListItem } from '$comp/blocks/blocks';
import ItemListNode from '$comp/editor/nodes/item-list-node.svelte';
import { mergeAttributes, Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from '../svelte-node-view-renderer';

export interface ItemListOptions {
	HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		itemList: {
			setItemList: (options?: { items?: ItemListItem[] }) => ReturnType;
		};
	}
}

export const ItemList = Node.create<ItemListOptions>({
	name: 'itemList',

	group: 'block',
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes() {
		return {
			items: {
				default: [],
				parseHTML: (element) => JSON.parse(element.getAttribute('data-items') || '[]'),
				renderHTML: (attributes) => ({
					'data-items': JSON.stringify(attributes.items),
				}),
			},
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="item-list"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'div',
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'item-list' }),
			'Item List Block',
		];
	},

	addCommands() {
		return {
			setItemList:
				(options = {}) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: {
							items: options.items || [],
						},
					});
				},
		};
	},

	addNodeView() {
		return SvelteNodeViewRenderer(ItemListNode);
	},
});
