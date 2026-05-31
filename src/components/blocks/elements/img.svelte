<script lang="ts">
	import type { ImageProps } from '../blocks';

	const { node }: ImageProps = $props();

	let srcset = $derived.by(() => {
		const sources = node.image.sources;
		if (!sources) return undefined;

		return Object.values(sources)
			.filter((source) => source.url && source.width)
			.sort((a, b) => a.width - b.width)
			.map((source) => `${source.url} ${source.width}w`)
			.join(', ');
	});
</script>

<figure class="my-2">
	<img
		src={node.image.url}
		{srcset}
		sizes="(min-width: 1024px) 760px, calc(100vw - 2rem)"
		alt={node.image.alternativeText ?? node.image.name}
		width={node.image.width}
		height={node.image.height}
		loading="lazy"
		decoding="async"
		class="rounded-sm"
	/>
	{#if node.image.caption}
		<figcaption>{node.image.caption}</figcaption>
	{/if}
</figure>
