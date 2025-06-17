<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import type { components } from '$lib/api/api';
	import type { FortuneUpgrade } from 'farming-weight';

	interface Props {
		upgrade: FortuneUpgrade;
		items?: components['schemas']['GetSpecifiedSkyblockItemsResponse']['items'];
		totalCost: number;
	}

	let { upgrade, items, totalCost }: Props = $props();
</script>

<div class="flex flex-col items-end justify-center">
	{#each Object.entries(upgrade.cost?.items ?? {}) as [item, amount] (item)}
		{@render itemCost(item, amount)}
	{/each}
	{#each Object.entries(upgrade.cost?.applyCost?.items ?? {}) as [item, amount] (item)}
		{@render itemCost(item, amount)}
	{/each}
	{#if upgrade.cost?.coins}
		<p class="text-sm">
			+ <span class="dark:text-completed">{upgrade.cost?.coins?.toLocaleString()}</span>
			<span class="text-muted-foreground">coins</span>
		</p>
	{/if}
	<span class="mt-1"
		>Total <span class="font-semibold dark:text-completed">{Math.round(totalCost).toLocaleString()}</span></span
	>
</div>

{#snippet itemCost(item: string, amount: number)}
	{@const sbItem = items?.[item]}
	<div class="flex flex-row items-center gap-1">
		<span class="text-sm font-semibold">{amount}x</span>
		<span class="rounded-sm border bg-background px-1">
			{#if sbItem?.data?.name}
				<span class="text-sm"><ItemName name={sbItem.data.name} /></span>
			{:else}
				<!-- Replace underscores with spaces and capitalize first letter of each word -->
				{@const itemName = item
					.replace(/_/g, ' ')
					.toLowerCase()
					.split(' ')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ')}

				<span class="text-sm">{itemName}</span>
			{/if}
		</span>

		{#if sbItem?.auctions && sbItem.auctions.length > 0}
			{@const lowest = Math.min(...sbItem.auctions.map((a) => a.lowest3Day))}
			<span class="ml-1 text-sm dark:text-completed">
				{Math.round(lowest * amount).toLocaleString()}
			</span>
			<span class="text-muted-foreground">coins</span>
		{:else if sbItem?.bazaar}
			{@const averageBuyOrder = sbItem.bazaar.averageBuyOrder}
			<span class="ml-1 text-sm dark:text-completed">
				{Math.round(averageBuyOrder * amount).toLocaleString()}
			</span>
			<span class="text-muted-foreground">coins</span>
		{/if}
	</div>
{/snippet}
