<script lang="ts">
	import type { UserOrderDto } from '$lib/api';
	import { formatOrderCurrency, summarizeOrderItems } from '../payments';

	interface Props {
		order: UserOrderDto;
	}

	let { order }: Props = $props();

	const summary = $derived.by(() => summarizeOrderItems(order));
</script>

<div class="min-w-32 text-right">
	<p class="font-semibold">{formatOrderCurrency(order.totalPrice, order.currency)}</p>
	<p class="text-muted-foreground text-xs">
		{summary.itemCount.toLocaleString()} line item{summary.itemCount === 1 ? '' : 's'}
	</p>
</div>
