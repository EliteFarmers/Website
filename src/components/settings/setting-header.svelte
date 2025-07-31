<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		class?: string;
	}

	let { children, class: className }: Props = $props();
</script>

<p class={cn('mt-2 mb-1 flex w-full flex-row items-center justify-between px-1 text-xl font-semibold', className)}>
	{@render children?.()}
</p>
