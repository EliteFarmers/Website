import { mergeAttributes, Node } from '@tiptap/core';

export interface TwoColumnOptions {
	HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		twoColumn: {
			setTwoColumn: (options?: { variant?: 'plain' | 'bordered' }) => ReturnType;
		};
	}
}

export const TwoColumn = Node.create<TwoColumnOptions>({
	name: 'twoColumn',

	group: 'block',

	content: 'columnLeft columnRight',

	draggable: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes() {
		return {
			variant: {
				default: 'plain',
				parseHTML: (element) => element.getAttribute('data-variant') || 'plain',
				renderHTML: (attributes) => ({
					'data-variant': attributes.variant,
				}),
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-type="two-column"]',
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'two-column' }), 0];
	},

	addCommands() {
		return {
			setTwoColumn:
				(options = {}) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: { variant: options.variant || 'plain' },
						content: [
							{
								type: 'columnLeft',
								content: [{ type: 'paragraph' }],
							},
							{
								type: 'columnRight',
								content: [{ type: 'paragraph' }],
							},
						],
					});
				},
		};
	},
});

export const ColumnLeft = Node.create({
	name: 'columnLeft',

	group: 'column',

	content: 'block+',

	parseHTML() {
		return [{ tag: 'div[data-type="column-left"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column-left' }), 0];
	},
});

export const ColumnRight = Node.create({
	name: 'columnRight',

	group: 'column',

	content: 'block+',

	parseHTML() {
		return [{ tag: 'div[data-type="column-right"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column-right' }), 0];
	},
});
