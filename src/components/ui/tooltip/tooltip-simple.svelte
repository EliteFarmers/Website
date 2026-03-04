<script lang="ts">
	import type { Tooltip as TooltipPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import Content from './tooltip-content.svelte';
	import Trigger from './tooltip-trigger.svelte';
	import Root from './tooltip.svelte';

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

<Root>
	<Trigger child={triggerChild}>
		{@render trigger?.()}
	</Trigger>
	<Content bind:ref {sideOffset} class={className} {...restProps} />
</Root>
