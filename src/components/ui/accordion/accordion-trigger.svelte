<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		level = 3,
		children,
		child,
		...restProps
	}: AccordionPrimitive.TriggerProps & {
		level?: AccordionPrimitive.HeaderProps['level'];
	} = $props();
</script>

<AccordionPrimitive.Header {level} class="flex">
	<AccordionPrimitive.Trigger
		bind:ref
		class={cn(
			'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
			className
		)}
		{...restProps}
		{child}
	>
		{#if !child}
			{@render children?.()}
			<ChevronDown class="size-4 shrink-0 transition-transform duration-200" />
		{/if}
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
