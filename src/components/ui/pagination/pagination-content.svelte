<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	type $$Props = HTMLAttributes<HTMLUListElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<div class={cn('flex flex-wrap items-center gap-1', className)} {...$$restProps}>
	<slot />
</div>
