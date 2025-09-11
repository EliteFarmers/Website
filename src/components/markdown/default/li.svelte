<script lang="ts">
	import { type PrimitiveElementAttributes, cn } from '$lib/utils.js';

	let { class: className, children, ...restProps }: PrimitiveElementAttributes = $props();
</script>

<li class={cn('mt-2 max-w-4xl', className)} {...restProps}>
	{@render children?.()}
</li>
