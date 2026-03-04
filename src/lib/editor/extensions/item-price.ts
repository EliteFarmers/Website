import ItemPriceNode from '$comp/editor/nodes/item-price-node.svelte';
import { mergeAttributes, Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from '../svelte-node-view-renderer';

export interface ItemPriceOptions {
	HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		itemPrice: {
			setItemPrice: (options: { skyblockId: string; multiplier?: number }) => ReturnType;
		};
	}
}

export const ItemPrice = Node.create<ItemPriceOptions>({
	name: 'itemPrice',

	group: 'inline',
	inline: true,
	atom: true,

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
				renderHTML: (attributes) => ({
					'data-skyblock-id': attributes.skyblockId,
				}),
			},
			multiplier: {
				default: 1,
				parseHTML: (element) => parseFloat(element.getAttribute('data-multiplier') || '1'),
				renderHTML: (attributes) => ({
					'data-multiplier': attributes.multiplier,
				}),
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: 'span[data-type="item-price"]',
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'item-price' }), 0];
	},

	addCommands() {
		return {
			setItemPrice:
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
		return SvelteNodeViewRenderer(ItemPriceNode);
	},
});
