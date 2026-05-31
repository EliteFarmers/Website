import { mergeAttributes, Node } from '@tiptap/core';

export interface LitematicAttrs {
	assetId: string;
	fileName: string;
	downloadUrl: string;
	name?: string | null;
	author?: string | null;
	width?: number | null;
	height?: number | null;
	length?: number | null;
	regionCount?: number;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		litematic: {
			setLitematic: (attrs: LitematicAttrs) => ReturnType;
		};
	}
}

export const Litematic = Node.create({
	name: 'litematic',
	group: 'block',
	atom: true,
	draggable: true,

	addAttributes() {
		return {
			assetId: { default: '' },
			fileName: { default: '' },
			downloadUrl: { default: '' },
			name: { default: null },
			author: { default: null },
			width: { default: null },
			height: { default: null },
			length: { default: null },
			regionCount: { default: 0 },
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-litematic]' }];
	},

	renderHTML({ HTMLAttributes }) {
		const title = HTMLAttributes.name || HTMLAttributes.fileName || 'Litematic schematic';
		const dims =
			HTMLAttributes.width && HTMLAttributes.height && HTMLAttributes.length
				? ` (${HTMLAttributes.width} x ${HTMLAttributes.height} x ${HTMLAttributes.length})`
				: '';

		return [
			'div',
			mergeAttributes(HTMLAttributes, {
				'data-litematic': '',
				class: 'not-prose rounded-md border p-3',
			}),
			['strong', {}, title],
			['span', {}, dims],
		];
	},

	addCommands() {
		return {
			setLitematic:
				(attrs) =>
				({ commands, state }) =>
					commands.insertContentAt(state.selection.to, {
						type: this.name,
						attrs,
					}),
		};
	},
});
