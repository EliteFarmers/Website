<script lang="ts">
	import type { TwoColumnBlockNode } from '$comp/blocks/blocks';
	import BlockRenderer from '../block-renderer.svelte';

	interface Props {
		node: TwoColumnBlockNode;
	}

	let { node }: Props = $props();

	let columnClasses = $derived(node.variant === 'bordered' ? 'rounded-lg border bg-card p-4' : '');
</script>

<div class="my-4 grid grid-cols-1 gap-4 md:grid-cols-2">
	<div class={columnClasses}>
		<BlockRenderer content={node.left} />
	</div>
	<div class={columnClasses}>
		<BlockRenderer content={node.right} />
	</div>
</div>
