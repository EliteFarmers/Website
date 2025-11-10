<script lang="ts">
	import type { ListItemProps } from '../blocks';
	import InlineRenderer from '../inline-renderer.svelte';

	const { node, modifiers }: ListItemProps = $props();
</script>

<li class="mt-2 max-w-4xl">
	<InlineRenderer nodes={node.children} {modifiers} />
</li>
