<script lang="ts">
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import type { CodeProps } from '../blocks';
	import InlineRenderer from '../inline-renderer.svelte';

	const { node, modifiers }: CodeProps = $props();

	const codeText = $derived(node.children.map((c) => c.text).join(''));
</script>

<div class="relative mt-6 mb-4">
	<CopyToClipboard text={codeText} size="icon" class="absolute top-2 right-2 h-7 w-7 opacity-70 hover:opacity-100" />
	<pre class="max-h-[650px] overflow-x-auto rounded-lg border bg-zinc-950 p-4 pr-12 dark:bg-zinc-900">
		<InlineRenderer nodes={node.children} {modifiers} />
	</pre>
</div>
