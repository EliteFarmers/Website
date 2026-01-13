import type { BlockGridCell } from '$comp/blocks/blocks';
import BlockGridNode from '$comp/editor/nodes/block-grid-node.svelte';
import { mergeAttributes, Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from '../svelte-node-view-renderer';

export interface BlockGridOptions {
	HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		blockGrid: {
			setBlockGrid: (options?: { rows?: number; cols?: number; cells?: BlockGridCell[][] }) => ReturnType;
		};
	}
}

export const BlockGrid = Node.create<BlockGridOptions>({
	name: 'blockGrid',

	group: 'block',
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes() {
		return {
			rows: {
				default: 3,
				parseHTML: (element) => parseInt(element.getAttribute('data-rows') || '3'),
				renderHTML: (attributes) => ({
					'data-rows': attributes.rows,
				}),
			},
			cols: {
				default: 3,
				parseHTML: (element) => parseInt(element.getAttribute('data-cols') || '3'),
				renderHTML: (attributes) => ({
					'data-cols': attributes.cols,
				}),
			},
			cells: {
				default: [],
				parseHTML: (element) => JSON.parse(element.getAttribute('data-cells') || '[]'),
				renderHTML: (attributes) => ({
					'data-cells': JSON.stringify(attributes.cells),
				}),
			},
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="block-grid"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'div',
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'block-grid' }),
			'Block Grid',
		];
	},

	addCommands() {
		return {
			setBlockGrid:
				(options = {}) =>
				({ commands }) => {
					const rows = options.rows || 3;
					const cols = options.cols || 3;
					const cells =
						options.cells ||
						Array(rows)
							.fill(null)
							.map(() => Array(cols).fill({}));
					return commands.insertContent({
						type: this.name,
						attrs: { rows, cols, cells },
					});
				},
		};
	},

	addNodeView() {
		return SvelteNodeViewRenderer(BlockGridNode);
	},
});
