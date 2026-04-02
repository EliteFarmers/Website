<script lang="ts">
	import type { UserOrderDto } from '$lib/api';
	import { formatOrderDateTime, getOrderResolutionText } from '../payments';

	interface Props {
		order: UserOrderDto;
	}

	let { order }: Props = $props();

	const resolutionText = $derived.by(() => getOrderResolutionText(order));
</script>

<div class="min-w-44 space-y-1">
	<p class="font-medium">{formatOrderDateTime(order.orderDate)}</p>
	{#if resolutionText}
		<p class="text-muted-foreground text-xs">{resolutionText}</p>
	{/if}
</div>
