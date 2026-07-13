<script lang="ts">
	import { buildImageSrcset, getLargestImageSourceUrl, GUIDE_IMAGE_SIZES } from '$lib/guides/responsive-images';
	import type { ImageProps } from '../blocks';

	const { node }: ImageProps = $props();

	let src = $derived(getLargestImageSourceUrl(node.image.sources) ?? node.image.url);
	let srcset = $derived(buildImageSrcset(node.image.sources));
	let displaySize = $derived(node.image.displaySize ?? 'natural');
	let align = $derived(node.image.align ?? 'center');
	let layoutStyle = $derived(`${sizeStyle(displaySize)} ${alignStyle(align)}`);

	function sizeStyle(size: typeof displaySize) {
		switch (size) {
			case 'small':
				return 'width: 100%; max-width: 20rem;';
			case 'medium':
				return 'width: 100%; max-width: 32rem;';
			case 'large':
				return 'width: 100%; max-width: 47.5rem;';
			case 'full':
				return 'width: 100%; max-width: 100%;';
			case 'natural':
			default:
				return 'width: auto; max-width: 100%;';
		}
	}

	function alignStyle(value: typeof align) {
		switch (value) {
			case 'left':
				return 'margin-left: 0; margin-right: auto;';
			case 'right':
				return 'margin-left: auto; margin-right: 0;';
			case 'center':
			default:
				return 'margin-left: auto; margin-right: auto;';
		}
	}
</script>

<figure class="my-2">
	<img
		{src}
		{srcset}
		sizes={srcset ? GUIDE_IMAGE_SIZES : undefined}
		alt={node.image.alternativeText ?? node.image.name}
		width={node.image.width}
		height={node.image.height}
		loading="lazy"
		decoding="async"
		style={layoutStyle}
		class="block rounded-sm"
	/>
	{#if node.image.caption}
		<figcaption style={layoutStyle}>{node.image.caption}</figcaption>
	{/if}
</figure>
