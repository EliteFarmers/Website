import type { Editor, NodeViewRenderer, NodeViewRendererProps } from '@tiptap/core';
import { mount, unmount, type Component } from 'svelte';

export interface SvelteNodeViewComponentProps {
	node: NodeViewRendererProps['node'];
	selected: boolean;
	updateAttributes: (attrs: Record<string, unknown>) => void;
	editor: Editor;
	getPos: () => number | undefined;
}

export function SvelteNodeViewRenderer(component: Component<SvelteNodeViewComponentProps>): NodeViewRenderer {
	return (props: NodeViewRendererProps) => {
		const { node, editor, getPos } = props;

		const tag = node.isInline ? 'span' : 'div';
		const dom = document.createElement(tag);
		dom.setAttribute('data-node-view-wrapper', '');

		const updateAttributes = (attrs: Record<string, unknown>) => {
			if (typeof getPos === 'function') {
				const pos = getPos();
				if (pos !== undefined) {
					editor.commands.command(({ tr }) => {
						tr.setNodeMarkup(pos, undefined, {
							...node.attrs,
							...attrs,
						});
						return true;
					});
				}
			}
		};

		const mounted = mount(component, {
			target: dom,
			props: {
				node,
				selected: false,
				updateAttributes,
				editor,
				getPos: () => (typeof getPos === 'function' ? getPos() : undefined),
			},
		});

		// Find contentDOM element for nodes with content
		const contentDOM = dom.querySelector('[data-node-view-content]') as HTMLElement | null;

		return {
			dom,
			contentDOM: contentDOM || undefined,
			update: (updatedNode) => {
				if (updatedNode.type !== node.type) {
					return false;
				}
				// We cannot update Svelte 5 props directly after mount without using $state.
				// Return false to trigger re-creation.
				return false;
			},
			destroy: () => {
				unmount(mounted);
			},
		};
	};
}
