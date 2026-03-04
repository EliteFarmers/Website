import type { RecipeSlot } from '$comp/blocks/blocks';
import RecipeNode from '$comp/editor/nodes/recipe-node.svelte';
import { mergeAttributes, Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from '../svelte-node-view-renderer';

export interface RecipeOptions {
	HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		recipe: {
			setRecipe: (options?: { grid?: RecipeSlot[]; output?: RecipeSlot }) => ReturnType;
		};
	}
}

export const Recipe = Node.create<RecipeOptions>({
	name: 'recipe',

	group: 'block',
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes() {
		return {
			grid: {
				default: Array(9).fill({}),
				parseHTML: (element) => JSON.parse(element.getAttribute('data-grid') || '[]'),
				renderHTML: (attributes) => ({
					'data-grid': JSON.stringify(attributes.grid),
				}),
			},
			output: {
				default: {},
				parseHTML: (element) => JSON.parse(element.getAttribute('data-output') || '{}'),
				renderHTML: (attributes) => ({
					'data-output': JSON.stringify(attributes.output),
				}),
			},
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="recipe"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'div',
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'recipe' }),
			'Recipe Block',
		];
	},

	addCommands() {
		return {
			setRecipe:
				(options = {}) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: {
							grid: options.grid || Array(9).fill({}),
							output: options.output || {},
						},
					});
				},
		};
	},

	addNodeView() {
		return SvelteNodeViewRenderer(RecipeNode);
	},
});
