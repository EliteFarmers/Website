<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		class?: string;
	}

	let { children, class: className }: Props = $props();
</script>

<p class={cn('mb-1 mt-2 flex w-full flex-row items-center justify-between px-1 text-xl font-semibold', className)}>
	{@render children?.()}
</p>
