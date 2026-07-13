<script lang="ts">
	import type { ImageAttachmentDto } from '$lib/api';
	import { buildImageSrcset, getLargestImageSourceUrl } from '$lib/guides/responsive-images';
	import type { HTMLImgAttributes } from 'svelte/elements';

	type Props = {
		image: ImageAttachmentDto;
		loading: 'lazy' | 'eager';
		alt?: string;
	} & HTMLImgAttributes;

	let {
		image,
		loading = 'lazy',
		alt,
		sizes = loading === 'lazy' ? 'auto, 100vw' : '100vw',
		...rest
	}: Props = $props();
	let { width, height, url, sources } = $derived(image);

	const src = $derived(getLargestImageSourceUrl(sources) ?? url);
	const srcset = $derived(buildImageSrcset(sources));
</script>

<img
	{src}
	{srcset}
	sizes={srcset ? sizes : undefined}
	alt={alt ?? image.title ?? ''}
	{width}
	{height}
	{loading}
	{...rest}
	decoding="async"
/>

<style>
	img {
		display: block;
		max-width: 100%;
		height: auto;
	}
</style>
