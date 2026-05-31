<script lang="ts">
	import type { TwoColumnBlockNode } from '$comp/blocks/blocks';
	import BlockRenderer from '../block-renderer.svelte';

	interface Props {
		node: TwoColumnBlockNode;
		hoistedComments?: Record<string, import('$lib/guides/types').CommentWithGuideAuthor[]>;
	}

	let { node, hoistedComments = {} }: Props = $props();

	let columnClasses = $derived(node.variant === 'bordered' ? 'rounded-lg border bg-card p-4' : '');
</script>

<div class="my-4 grid grid-cols-1 gap-4 md:grid-cols-2">
	<div class={columnClasses}>
		<BlockRenderer content={node.left} {hoistedComments} />
	</div>
	<div class={columnClasses}>
		<BlockRenderer content={node.right} {hoistedComments} />
	</div>
</div>
