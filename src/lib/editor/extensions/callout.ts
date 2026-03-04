import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core';

export type CalloutVariant = 'note' | 'tip' | 'warning' | 'danger' | 'success' | 'question' | 'example' | 'quote';

export interface CalloutOptions {
	HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		callout: {
			setCallout: (options?: { variant?: CalloutVariant }) => ReturnType;
			toggleCallout: (options?: { variant?: CalloutVariant }) => ReturnType;
		};
	}
}

export const Callout = Node.create<CalloutOptions>({
	name: 'callout',

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
			variant: {
				default: 'note',
				parseHTML: (element) => element.getAttribute('data-variant') || 'note',
				renderHTML: (attributes) => ({
					'data-variant': attributes.variant,
				}),
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-type="callout"]',
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'div',
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				'data-type': 'callout',
				class: `markdown-alert markdown-alert-${HTMLAttributes['data-variant'] || 'note'}`,
			}),
			0,
		];
	},

	addCommands() {
		return {
			setCallout:
				(options = {}) =>
				({ commands }) => {
					return commands.wrapIn(this.name, { variant: options.variant || 'note' });
				},
			toggleCallout:
				(options = {}) =>
				({ commands }) => {
					return commands.toggleWrap(this.name, { variant: options.variant || 'note' });
				},
		};
	},

	addInputRules() {
		return [
			wrappingInputRule({
				find: /^>\s*\[!(note|tip|warning|danger|success|question|example|quote)\]\s*$/i,
				type: this.type,
				getAttributes: (match) => ({
					variant: match[1].toLowerCase() as CalloutVariant,
				}),
			}),
		];
	},
});
