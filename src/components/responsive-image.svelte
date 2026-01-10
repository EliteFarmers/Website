<script lang="ts">
	import type { ImageAttachmentDto } from '$lib/api';
	import type { HTMLImgAttributes } from 'svelte/elements';

	type Props = {
		image: ImageAttachmentDto;
		loading: 'lazy' | 'eager';
		alt?: string;
	} & HTMLImgAttributes;

	let { image, loading = 'lazy', alt, ...rest }: Props = $props();
	let { width, height, url, sources } = $derived(image);

	const srcset = $derived(
		Object.values(sources)
			.map((source) => `${source.url} ${source.width}w`)
			.join(', ')
	);

	const sizes = '(max-width: 600px) 90vw, (max-width: 1024px) 50vw, 1920px';
</script>

<img src={url} {srcset} {sizes} alt={alt ?? image.title ?? ''} {width} {height} {loading} {...rest} decoding="async" />

<style>
	img {
		display: block;
		max-width: 100%;
		height: auto;
	}
</style>
