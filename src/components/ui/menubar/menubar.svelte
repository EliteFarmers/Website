<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	let { ref = $bindable(null), class: className, ...restProps }: MenubarPrimitive.RootProps = $props();
</script>

<MenubarPrimitive.Root
	bind:ref
	data-slot="menubar"
	class={cn('bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs', className)}
	{...restProps}
/>
