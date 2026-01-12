<script lang="ts">
	import type { CalloutBlockNode } from '$comp/blocks/blocks';
	import BlockRenderer from '../block-renderer.svelte';

	interface Props {
		node: CalloutBlockNode;
	}

	let { node }: Props = $props();

	const variantClasses: Record<string, string> = {
		note: 'border-blue-600/20 bg-blue-400/20 dark:border-blue-800/20 dark:bg-blue-600/10',
		tip: 'border-cyan-600/20 bg-cyan-400/20 dark:border-cyan-800/20 dark:bg-cyan-600/10',
		warning: 'border-orange-600/20 bg-orange-400/20 dark:border-orange-800/20 dark:bg-orange-600/10',
		danger: 'border-red-600/20 bg-red-400/20 dark:border-red-800/20 dark:bg-red-600/10',
		success: 'border-green-600/20 bg-green-400/20 dark:border-green-800/20 dark:bg-green-600/10',
		question: 'border-orange-600/20 bg-orange-400/20 dark:border-orange-800/20 dark:bg-orange-600/10',
		example: 'border-purple-600/20 bg-purple-400/20 dark:border-purple-800/20 dark:bg-purple-600/10',
		quote: 'border-zinc-600/20 bg-zinc-400/20 dark:border-zinc-800/20 dark:bg-zinc-600/15',
	};

	const titleColors: Record<string, string> = {
		note: 'text-blue-500',
		tip: 'text-cyan-500',
		warning: 'text-orange-500',
		danger: 'text-red-500',
		success: 'text-green-500',
		question: 'text-orange-500',
		example: 'text-purple-500',
		quote: 'text-zinc-500',
	};

	const variantLabels: Record<string, string> = {
		note: 'Note',
		tip: 'Tip',
		warning: 'Warning',
		danger: 'Danger',
		success: 'Success',
		question: 'Question',
		example: 'Example',
		quote: 'Quote',
	};

	let classes = $derived(variantClasses[node.variant] || variantClasses.note);
	let titleColor = $derived(titleColors[node.variant] || titleColors.note);
	let label = $derived(variantLabels[node.variant] || 'Note');
</script>

<div class="my-6 space-y-2 rounded-lg border p-4 pb-5 {classes}">
	<div class="flex items-center gap-2 font-bold {titleColor}">
		{label}
	</div>
	<div class="space-y-2">
		<BlockRenderer content={node.children} />
	</div>
</div>
