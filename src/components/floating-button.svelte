<script lang="ts">
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$ui/button';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<div class="group fixed right-4 bottom-4 z-50 size-12 rounded-full shadow-xl md:right-10 md:bottom-10 md:size-16">
	<button
		{...rest}
		class={cn(
			buttonVariants({ variant: 'default' }),
			'flex h-full w-full flex-row items-center justify-center rounded-full',
			className
		)}
	>
		{@render children?.()}
	</button>
</div>
