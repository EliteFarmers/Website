<script lang="ts">
	import { getAdCtx } from '$lib/hooks/ads.svelte';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$ui/button';
	import { watch } from 'runed';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const adCtx = getAdCtx();

	let bottom = $state(0);

	watch(
		() => adCtx.bottomAnchorSize.height,
		() => {
			bottom = adCtx.bottomAnchorSize.height || 0;
		}
	);
</script>

<div
	class="group fixed right-4 z-50 mb-4 size-12 rounded-full shadow-xl md:right-10 md:mb-6 md:size-16"
	style="bottom: {bottom}px"
>
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
