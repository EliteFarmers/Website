<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	let {
		ratio,
		class: className,
		title,
		maxed,
		children,
		...rest
	}: {
		ratio: number;
		class?: string;
		title?: string;
		maxed?: boolean;
		children?: Snippet;
	} = $props();

	const clamped = $derived(Math.min(1, Math.max(0, ratio ?? 0)));
	const percent = $derived(Math.round(clamped * 100));
</script>

<div
	role="progressbar"
	aria-label={title}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={percent}
	{title}
	class={cn('relative h-5 w-32', className)}
	{...rest}
>
	<div
		class="bg-muted absolute top-1/2 left-0 h-1.5 w-full -translate-y-1/2 overflow-hidden rounded-full"
		aria-hidden="true"
	>
		<div
			class="{maxed ? 'bg-completed' : 'bg-progress'} h-full w-full transition-transform"
			style="transform: translateX(-{100 - percent}%)"
		></div>
	</div>

	{@render children?.()}
</div>
