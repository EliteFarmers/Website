<script lang="ts">
	import type { ParagraphProps } from '../blocks';
	import InlineRenderer from '../inline-renderer.svelte';
	const { node, modifiers }: ParagraphProps = $props();
</script>

{#if node.children.length === 0}
	<br />
{:else if node.children.length === 1 && node.children[0].type === 'text' && node.children[0].text === ''}
	<br />
{:else}
	<p class="leading-7 wrap-break-word not-first:mt-6"><InlineRenderer nodes={node.children} {modifiers} /></p>
{/if}
