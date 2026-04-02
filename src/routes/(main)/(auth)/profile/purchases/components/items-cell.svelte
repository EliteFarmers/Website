<script lang="ts">
	import type { UserOrderDto } from '$lib/api';
	import { summarizeOrderItems } from '../payments';

	interface Props {
		order: UserOrderDto;
	}

	let { order }: Props = $props();

	const summary = $derived.by(() => summarizeOrderItems(order));
</script>

<div class="min-w-64 space-y-1">
	{#each summary.lines as line (line)}
		<p class="truncate text-sm">{line}</p>
	{/each}

	{#if summary.extraCount > 0}
		<p class="text-muted-foreground text-xs">
			+{summary.extraCount} more line item{summary.extraCount === 1 ? '' : 's'}
		</p>
	{/if}

	<p class="text-muted-foreground text-xs">
		{summary.totalQuantity.toLocaleString()} total unit{summary.totalQuantity === 1 ? '' : 's'}
	</p>
</div>
