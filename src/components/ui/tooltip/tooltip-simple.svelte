<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		trigger,
		child: triggerChild,
		...restProps
	}: TooltipPrimitive.ContentProps & {
		trigger?: Snippet;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();
</script>

<TooltipPrimitive.Provider>
	<TooltipPrimitive.Root delayDuration={0}>
		<TooltipPrimitive.Trigger>
			{#snippet child(data)}
				{@render triggerChild?.(data)}
			{/snippet}
			{@render trigger?.()}
		</TooltipPrimitive.Trigger>
		<TooltipPrimitive.Content
			bind:ref
			{sideOffset}
			class={cn(
				'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
				className
			)}
			{...restProps}
		/>
	</TooltipPrimitive.Root>
</TooltipPrimitive.Provider>
