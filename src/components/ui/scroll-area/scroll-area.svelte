<script lang="ts">
	import { cn, type WithoutChild } from '$lib/utils.js';
	import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui';
	import { Scrollbar } from './index.js';

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

	function handleWheel(e: WheelEvent) {
		if (!viewRef) return;

		// Check if the user is primarily scrolling vertically. This helps avoid
		// interfering with touchpad gestures that might have both X and Y deltas.
		if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
			// Check if we can scroll further horizontally, if not, allow vertical scrolling of the page
			const maxScrollLeft = viewRef.scrollWidth - viewRef.clientWidth;
			if (viewRef.scrollLeft > 0 && viewRef.scrollLeft >= maxScrollLeft && e.deltaY > 0) {
				return;
			}

			const maxScrollRight = viewRef.scrollWidth - viewRef.clientWidth;
			if (viewRef.scrollLeft < maxScrollRight && viewRef.scrollLeft <= 0 && e.deltaY < 0) {
				return;
			}

			// Prevent the default vertical scroll behavior of the page.
			e.preventDefault();

			// Apply the vertical scroll amount to the horizontal scroll position.
			viewRef.scrollLeft += e.deltaY;
		}
	}
</script>

<ScrollAreaPrimitive.Root bind:ref data-slot="scroll-area" class={cn('relative', className)} {...restProps}>
	<ScrollAreaPrimitive.Viewport
		bind:ref={viewRef}
		data-slot="scroll-area-viewport"
		class={cn('h-full w-full rounded-[inherit]', viewClass)}
		onwheel={orientation === 'horizontal' || orientation === 'both' ? handleWheel : undefined}
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
