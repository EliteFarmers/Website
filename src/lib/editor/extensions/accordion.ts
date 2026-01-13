import AccordionNode from '$comp/editor/nodes/accordion-node.svelte';
import { mergeAttributes, Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from '../svelte-node-view-renderer';

export interface AccordionOptions {
	HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		accordion: {
			setAccordion: (options?: { title?: string }) => ReturnType;
		};
	}
}

export const Accordion = Node.create<AccordionOptions>({
	name: 'accordion',

	group: 'block',
	content: 'block+',
	defining: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes() {
		return {
			title: {
				default: 'Click to expand',
				parseHTML: (element) => element.getAttribute('data-title'),
				renderHTML: (attributes) => {
					return {
						'data-title': attributes.title,
					};
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: 'details[data-type="accordion"]',
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'details',
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				'data-type': 'accordion',
				class: 'accordion-block',
				open: true,
			}),
			['summary', { class: 'accordion-title' }, HTMLAttributes['data-title'] || 'Click to expand'],
			['div', { class: 'accordion-content' }, 0],
		];
	},

	addCommands() {
		return {
			setAccordion:
				(options = {}) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: { title: options.title || 'Click to expand' },
						content: [{ type: 'paragraph' }],
					});
				},
		};
	},

	addNodeView() {
		return SvelteNodeViewRenderer(AccordionNode);
	},
});
