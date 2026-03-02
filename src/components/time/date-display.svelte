<script lang="ts">
	import { cn } from '$lib/utils';
	import PopoverMobile from '$ui/popover/popover-mobile.svelte';
	import type { Snippet } from 'svelte';
	import Time from 'svelte-time';

	interface Props {
		timestamp: number;
		class?: string;
		format?: string;
		children?: Snippet;
	}

	let { timestamp, class: className, format = 'MMMM D, YYYY', children }: Props = $props();
</script>

<PopoverMobile
	class={cn('bg-muted inline-block w-fit', className)}
	triggerClass="inline-flex min-h-6 w-fit items-center"
>
	{#snippet trigger()}
		<span class="inline-flex min-h-6 max-w-fit items-center rounded px-1">
			<Time {timestamp} {format} />
		</span>
	{/snippet}
	<div class="flex flex-col items-center gap-4 p-2">
		<Time {timestamp} format="dddd, MMMM D, YYYY h:mm A" />
		{@render children?.()}
	</div>
</PopoverMobile>
