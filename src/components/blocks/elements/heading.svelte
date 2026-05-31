<script lang="ts">
	import type { HeadingProps } from '../blocks.js';

	import H1 from '$comp/markdown/default/h1.svelte';
	import H2 from '$comp/markdown/default/h2.svelte';
	import H3 from '$comp/markdown/default/h3.svelte';
	import H4 from '$comp/markdown/default/h4.svelte';
	import H5 from '$comp/markdown/default/h5.svelte';
	import H6 from '$comp/markdown/default/h6.svelte';
	import InlineRenderer from '../inline-renderer.svelte';

	const { node, modifiers }: HeadingProps = $props();
</script>

{#if node.level === 1}
	<H1><InlineRenderer nodes={node.children} {modifiers} /></H1>
{:else if node.level === 2}
	<H2><InlineRenderer nodes={node.children} {modifiers} /></H2>
{:else if node.level === 3}
	<H3><InlineRenderer nodes={node.children} {modifiers} /></H3>
{:else if node.level === 4}
	<H4><InlineRenderer nodes={node.children} {modifiers} /></H4>
{:else if node.level === 5}
	<H5><InlineRenderer nodes={node.children} {modifiers} /></H5>
{:else}
	<H6><InlineRenderer nodes={node.children} {modifiers} /></H6>
{/if}
