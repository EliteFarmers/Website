<script lang="ts">
	import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui';
	import { Scrollbar } from './index.js';
	import { cn, type WithoutChild } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		viewRef = $bindable(null),
		class: className,
		viewClass,
		orientation = 'vertical',
		scrollbarXClasses = '',
		scrollbarYClasses = '',
		children,
		...restProps
	}: WithoutChild<ScrollAreaPrimitive.RootProps> & {
		viewRef?: ScrollAreaPrimitive.ViewportProps['ref'];
		viewClass?: string | undefined;
		orientation?: 'vertical' | 'horizontal' | 'both' | undefined;
		scrollbarXClasses?: string | undefined;
		scrollbarYClasses?: string | undefined;
	} = $props();
</script>

<ScrollAreaPrimitive.Root bind:ref data-slot="scroll-area" class={cn('relative', className)} {...restProps}>
	<ScrollAreaPrimitive.Viewport
		bind:ref={viewRef}
		data-slot="scroll-area-viewport"
		class={cn('h-full w-full rounded-[inherit]', viewClass)}
	>
		{@render children?.()}
	</ScrollAreaPrimitive.Viewport>
	{#if orientation === 'vertical' || orientation === 'both'}
		<Scrollbar orientation="vertical" class={scrollbarYClasses} />
	{/if}
	{#if orientation === 'horizontal' || orientation === 'both'}
		<Scrollbar orientation="horizontal" class={scrollbarXClasses} />
	{/if}
	<ScrollAreaPrimitive.Corner />
</ScrollAreaPrimitive.Root>
