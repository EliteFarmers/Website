<script lang="ts">
	// import { onMount } from 'svelte';
	// import CopyButton from "$lib/components/docs/copy-button.svelte";
	import { type PrimitiveElementAttributes, cn } from '$lib/utils.js';

	let { class: className, children, ...restProps }: PrimitiveElementAttributes = $props();
</script>

<pre
	class={cn('mt-6 mb-4 max-h-[650px] overflow-x-auto rounded-lg border bg-zinc-950 p-4 dark:bg-zinc-900', className)}
	{...restProps}>
	{@render children?.()}
</pre>
<!-- <CopyButton text={code} class={cn("pre-copy-btn absolute right-2 top-2")} /> -->
