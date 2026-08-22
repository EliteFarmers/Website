<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Tabs as TabsPrimitive } from 'bits-ui';

	let { ref = $bindable(null), class: className, ...restProps }: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	data-slot="tabs-list"
	class={cn(
		'inline-flex h-9 w-fit items-center justify-center rounded-lg bg-card p-0.75 text-muted-foreground',
		className
	)}
	{...restProps}
/>
