import YouTubeNode from '$comp/editor/nodes/youtube-node.svelte';
import { mergeAttributes, Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from '../svelte-node-view-renderer';

export interface YouTubeOptions {
	HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		youtube: {
			setYouTube: (options: { videoId: string }) => ReturnType;
		};
	}
}

export const YouTube = Node.create<YouTubeOptions>({
	name: 'youtube',

	group: 'block',
	atom: true,

	draggable: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes() {
		return {
			videoId: {
				default: null,
				parseHTML: (element) => element.getAttribute('data-video-id'),
				renderHTML: (attributes) => ({
					'data-video-id': attributes.videoId,
				}),
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-type="youtube"]',
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'youtube' }), 0];
	},

	addCommands() {
		return {
			setYouTube:
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
		return SvelteNodeViewRenderer(YouTubeNode);
	},
});
