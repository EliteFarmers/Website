<script lang="ts">
	import type { QuoteProps } from '../blocks';
	import InlineRenderer from '../inline-renderer.svelte';

	const { node, modifiers, renderTextAsHtml = false }: QuoteProps = $props();
</script>

<blockquote class="mt-6 border-l-2 pl-6 italic">
	<InlineRenderer nodes={node.children} {modifiers} {renderTextAsHtml} />
</blockquote>
