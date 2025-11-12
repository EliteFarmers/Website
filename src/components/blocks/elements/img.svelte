<script lang="ts">
	import type { ImageProps } from '../blocks';

	const { node }: ImageProps = $props();
</script>

<figure class="my-2">
	<img
		src={node.image.url}
		alt={node.image.alternativeText ?? node.image.name}
		width={node.image.width}
		height={node.image.height}
		class="rounded-sm"
	/>
	{#if node.image.caption}
		<figcaption>{node.image.caption}</figcaption>
	{/if}
</figure>
