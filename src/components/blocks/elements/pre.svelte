<script lang="ts">
	// import { onMount } from 'svelte';
	// import CopyButton from "$lib/components/docs/copy-button.svelte";
	import type { CodeProps } from '../blocks';
	import InlineRenderer from '../inline-renderer.svelte';

	const { node, modifiers }: CodeProps = $props();
</script>

<pre class="mt-6 mb-4 max-h-[650px] overflow-x-auto rounded-lg border bg-zinc-950 p-4 dark:bg-zinc-900">
	<InlineRenderer nodes={node.children} {modifiers} />
</pre>
<!-- <CopyButton text={code} class={cn("pre-copy-btn absolute right-2 top-2")} /> -->
