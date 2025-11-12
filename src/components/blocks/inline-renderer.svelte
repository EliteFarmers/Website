<script lang="ts">
	import { isLinkNode, isTextNode, type InlineRendererProps } from './blocks.js';
	import InlineRenderer from './inline-renderer.svelte';
	import TextRenderer from './text-renderer.svelte';

	const { nodes, modifiers }: InlineRendererProps = $props();
</script>

{#each nodes as node, i (`${node.type}-${i}`)}
	{#if isTextNode(node)}
		<TextRenderer {node} {modifiers} />
	{:else if isLinkNode(node)}
		{@const Link = modifiers.link}
		<Link url={node.url}>
			<InlineRenderer nodes={node.children} {modifiers} />
		</Link>
	{/if}
{/each}
