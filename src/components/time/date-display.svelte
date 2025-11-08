<script lang="ts">
	import PopoverMobile from '$ui/popover/popover-mobile.svelte';
	import Time from 'svelte-time';

	interface Props {
		timestamp: number;
	}

	let { timestamp }: Props = $props();
</script>

<PopoverMobile class="inline-block w-fit" triggerClass="w-fit">
	{#snippet trigger()}
		<span class="bg-muted max-w-fit rounded px-1">
			<Time {timestamp} format="MMMM D, YYYY" />
		</span>
	{/snippet}
	<div class="flex flex-col items-center gap-4 p-2">
		<Time {timestamp} format="dddd, MMMM D, YYYY h:mm A" />
	</div>
</PopoverMobile>
