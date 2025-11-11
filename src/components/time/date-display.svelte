<script lang="ts">
	import { cn } from '$lib/utils';
	import PopoverMobile from '$ui/popover/popover-mobile.svelte';
	import Time from 'svelte-time';

	interface Props {
		timestamp: number;
		class?: string;
	}

	let { timestamp, class: className }: Props = $props();
</script>

<PopoverMobile class={cn('inline-block w-fit', className)} triggerClass="w-fit">
	{#snippet trigger()}
		<span class="bg-muted max-w-fit rounded px-1">
			<Time {timestamp} format="MMMM D, YYYY" />
		</span>
	{/snippet}
	<div class="flex flex-col items-center gap-4 p-2">
		<Time {timestamp} format="dddd, MMMM D, YYYY h:mm A" />
	</div>
</PopoverMobile>
