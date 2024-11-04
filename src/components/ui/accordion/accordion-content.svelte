<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { slide } from 'svelte/transition';
	import { cn } from '$lib/utils.js';

	type $$Props = AccordionPrimitive.ContentProps & {
		wrapperClass?: string;
	};

	let className: $$Props['class'] = undefined;
	export let transition: $$Props['transition'] = slide;
	export let transitionConfig: $$Props['transitionConfig'] = {
		duration: 200,
	};
	export { className as class };
	export let wrapperClass: $$Props['wrapperClass'] = 'pb-4 pt-0';
</script>

<AccordionPrimitive.Content
	class={cn('overflow-hidden text-sm transition-all', className)}
	{transition}
	{transitionConfig}
	{...$$restProps}
>
	<div class={wrapperClass}>
		<slot />
	</div>
</AccordionPrimitive.Content>
