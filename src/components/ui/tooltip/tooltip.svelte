<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	type $$Props = TooltipPrimitive.Props;

	export let openDelay: $$Props['openDelay'] = 50;
</script>

<TooltipPrimitive.Root {openDelay} {...$$restProps}>
	<slot />
</TooltipPrimitive.Root>
