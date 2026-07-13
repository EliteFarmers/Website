<script lang="ts">
	import type { UserOrderDto } from '$lib/api';
	import { Badge } from '$ui/badge';
	import { getOrderProviderLabel, getOrderStatusVariant, humanizeOrderLabel } from '../payments';

	interface Props {
		order: UserOrderDto;
	}

	let { order }: Props = $props();
</script>

<div class="min-w-44 space-y-2">
	<div class="flex flex-wrap gap-1">
		<Badge variant={getOrderStatusVariant(order.status)}>{humanizeOrderLabel(order.status)}</Badge>
		<Badge variant="secondary">{getOrderProviderLabel(order.provider)}</Badge>
	</div>

	{#if order.providerStatus}
		<p class="text-muted-foreground text-xs">Provider: {humanizeOrderLabel(order.providerStatus)}</p>
	{/if}

	{#if order.recurringReference}
		<p class="text-muted-foreground text-xs">Recurring payment</p>
	{/if}
</div>
