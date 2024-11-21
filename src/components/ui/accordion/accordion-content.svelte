<script lang="ts">
	import { Accordion as AccordionPrimitive, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		wrapperClass = 'pb-4 pt-0',
		children,
		...restProps
	}: WithoutChild<AccordionPrimitive.ContentProps> & { wrapperClass?: string } = $props();
</script>

<AccordionPrimitive.Content
	bind:ref
	class={cn(
		'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
		className
	)}
	{...restProps}
>
	<div class={wrapperClass}>
		{@render children?.()}
	</div>
</AccordionPrimitive.Content>
