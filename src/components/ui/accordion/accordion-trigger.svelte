<script lang="ts">
	import { cn } from '$lib/utils.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { Accordion as AccordionPrimitive } from 'bits-ui';

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
		data-slot="accordion-trigger"
		bind:ref
		class={cn(
			'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-center justify-between rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
			className
		)}
		{...restProps}
		{child}
	>
		{#if !child}
			{@render children?.()}
			<ChevronDownIcon
				class="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200"
			/>
		{/if}
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
