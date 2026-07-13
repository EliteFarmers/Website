import { buildImageSrcset, getLargestImageSourceUrl, GUIDE_IMAGE_SIZES } from '$lib/guides/responsive-images';
import Image from '@tiptap/extension-image';

export const GuideImage = Image.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			assetId: {
				default: null,
				parseHTML: (element) => element.getAttribute('data-asset-id'),
				renderHTML: (attributes) => (attributes.assetId ? { 'data-asset-id': attributes.assetId } : {}),
			},
			sources: {
				default: null,
				parseHTML: (element) => {
					const value = element.getAttribute('data-sources');
					if (!value) return null;
					try {
						return JSON.parse(value);
					} catch {
						return null;
					}
				},
				renderHTML: (attributes) =>
					attributes.sources
						? {
								'data-sources': JSON.stringify(attributes.sources),
								src: getLargestImageSourceUrl(attributes.sources) ?? attributes.src,
								srcset: buildImageSrcset(attributes.sources),
								sizes: GUIDE_IMAGE_SIZES,
								loading: 'lazy',
								decoding: 'async',
							}
						: {},
			},
			displaySize: {
				default: 'natural',
				parseHTML: (element) => element.getAttribute('data-image-size') || 'natural',
				renderHTML: (attributes) => ({ 'data-image-size': attributes.displaySize || 'natural' }),
			},
			align: {
				default: 'center',
				parseHTML: (element) => element.getAttribute('data-image-align') || 'center',
				renderHTML: (attributes) => ({ 'data-image-align': attributes.align || 'center' }),
			},
			width: {
				default: null,
				parseHTML: (element) => element.getAttribute('width'),
				renderHTML: (attributes) => (attributes.width ? { width: attributes.width } : {}),
			},
			height: {
				default: null,
				parseHTML: (element) => element.getAttribute('height'),
				renderHTML: (attributes) => (attributes.height ? { height: attributes.height } : {}),
			},
		};
	},
});
