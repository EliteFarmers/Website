<script lang="ts">
	import type { ListItemProps } from '../blocks';
	import HoistedCommentCallout from '$comp/comments/hoisted-comment-callout.svelte';
	import InlineRenderer from '../inline-renderer.svelte';

	const { node, modifiers, hoistedComments = {}, renderTextAsHtml = false }: ListItemProps = $props();
	let comments = $derived(node.id ? (hoistedComments[node.id] ?? []) : []);
</script>

<li id={node.id} class="mt-2 max-w-4xl scroll-mt-24">
	<InlineRenderer nodes={node.children} {modifiers} {renderTextAsHtml} />
	{#if comments.length}
		<div class="not-prose mt-2">
			{#each comments as comment (comment.id)}
				<HoistedCommentCallout {comment} />
			{/each}
		</div>
	{/if}
</li>
