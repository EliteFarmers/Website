<script lang="ts">
	import type { UserOrderDto } from '$lib/api';
	import { Badge } from '$ui/badge';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import { getOrderDisplayId, getOrderRecipientText, getOrderRelationshipLabels } from '../payments';

	interface Props {
		order: UserOrderDto;
	}

	let { order }: Props = $props();

	const relationshipLabels = $derived.by(() => getOrderRelationshipLabels(order));
	const recipientText = $derived.by(() => getOrderRecipientText(order));
	const reassignableGiftCount = $derived.by(() => order.items.filter((item) => item.gift?.isReassignable).length);
</script>

<div class="min-w-56 space-y-2">
	<div class="space-y-1">
		<div class="flex items-start gap-2">
			{#if reassignableGiftCount > 0}
				<div class="bg-destructive/10 text-destructive mt-0.5 rounded-full p-1">
					<AlertTriangle class="size-3.5" />
				</div>
			{/if}

			<div class="space-y-1">
				<p class="font-medium">Order #{getOrderDisplayId(order.orderId)}</p>
				<p class="text-muted-foreground font-mono text-xs break-all">{order.orderId}</p>
				{#if recipientText}
					<p class="text-muted-foreground text-xs">{recipientText}</p>
				{/if}
			</div>
		</div>
	</div>

	{#if relationshipLabels.length || reassignableGiftCount > 0}
		<div class="flex flex-wrap gap-1">
			{#if reassignableGiftCount > 0}
				<Badge variant="destructive" class="text-[11px]">
					{reassignableGiftCount} gift{reassignableGiftCount === 1 ? '' : 's'} need reassignment
				</Badge>
			{/if}

			{#each relationshipLabels as label (label)}
				<Badge variant="outline" class="text-[11px]">{label}</Badge>
			{/each}
		</div>
	{/if}
</div>
