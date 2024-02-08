<script lang="ts">
	import PopoverPrimitiveTrigger from './popover-primitive-trigger.svelte';
	import type { Popover as PopoverPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	type $$Props = PopoverPrimitive.Trigger['ContentProps'];
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<PopoverPrimitiveTrigger
	class={cn('z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none', className)}
	{...$$restProps}
>
	<slot />
</PopoverPrimitiveTrigger>
