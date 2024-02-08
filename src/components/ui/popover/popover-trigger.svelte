<script lang="ts">
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	type $$Props = PopoverPrimitive.Trigger['ContentProps'];
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<PopoverPrimitive.Trigger
	class={cn('z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none', className)}
	{...$$restProps}
>
	<slot />
</PopoverPrimitive.Trigger>
