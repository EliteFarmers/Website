<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLOlAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLOlAttributes> = $props();
</script>

<ol
	bind:this={ref}
	data-slot="breadcrumb-list"
	class={cn('text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5', className)}
	{...restProps}
>
	{@render children?.()}
</ol>
