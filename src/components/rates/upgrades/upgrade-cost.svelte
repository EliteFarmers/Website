<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import ScrollingName from '$comp/items/scrolling-name.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { cn } from '$lib/utils';
	import type { FortuneUpgrade } from 'farming-weight';

	interface Props {
		upgrade: FortuneUpgrade;
		items?: RatesItemPriceData;
		totalCost: number;
		class?: string;
	}

	let { upgrade, items, totalCost, class: className }: Props = $props();

	const copper = $derived((upgrade.cost?.copper ?? 0) + (upgrade.cost?.applyCost?.copper ?? 0));
	const bits = $derived((upgrade.cost?.bits ?? 0) + (upgrade.cost?.applyCost?.bits ?? 0));
	const kernels = $derived((upgrade.cost?.kernels ?? 0) + (upgrade.cost?.applyCost?.kernels ?? 0));
	const goldMedal = $derived(upgrade.cost?.medals?.gold ?? 0);
</script>

<div class={cn('flex w-full min-w-0 flex-col items-start justify-center sm:min-w-72 sm:items-end', className)}>
	{#each Object.entries(upgrade.cost?.items ?? {}) as [item, amount] (item)}
		{@render itemCost(item, amount)}
	{/each}
	{#each Object.entries(upgrade.cost?.applyCost?.items ?? {}) as [item, amount] (item)}
		{@render itemCost(item, amount)}
	{/each}
	{#if upgrade.cost?.coins}
		<p class="text-muted-foreground text-sm">
			+ <span class="text-primary dark:text-completed">{upgrade.cost?.coins?.toLocaleString()}</span>
			<span class="text-muted-foreground">coins</span>
		</p>
	{/if}
	{#if upgrade.cost?.applyCost?.coins}
		<p class="text-muted-foreground text-sm">
			+ <span class="text-primary dark:text-completed">{upgrade.cost?.applyCost?.coins?.toLocaleString()}</span>
			<span class="text-muted-foreground">coins to apply</span>
		</p>
	{/if}
	{#if copper > 0}
		<p class="text-sm">
			<span class="dark:text-completed">{copper.toLocaleString()}</span>
			<span class="text-muted-foreground">copper</span>
		</p>
	{/if}
	{#if bits > 0}
		<p class="text-sm">
			<span class="dark:text-completed">{bits.toLocaleString()}</span>
			<span class="text-muted-foreground">bits</span>
		</p>
	{/if}
	{#if kernels > 0}
		<p class="text-sm">
			<span class="dark:text-completed">{kernels.toLocaleString()}</span>
			<span class="text-muted-foreground">kernel{kernels === 1 ? '' : 's'}</span>
		</p>
	{/if}
	{#if goldMedal > 0}
		<p class="text-sm">
			<span class="dark:text-completed">{goldMedal.toLocaleString()}</span>
			<span class="text-muted-foreground">gold medal{goldMedal === 1 ? '' : 's'}</span>
		</p>
	{/if}
	{#if totalCost || !(copper > 0 || bits > 0 || kernels > 0 || goldMedal > 0)}
		{#if totalCost === 0 && !(copper > 0 || bits > 0 || kernels > 0 || goldMedal > 0)}
			<span class="text-muted-foreground">Not Available</span>
		{:else}
			<span class="mt-1"
				>Total <span class="dark:text-completed font-semibold">{Math.round(totalCost).toLocaleString()}</span
				></span
			>
		{/if}
	{/if}
</div>

{#snippet itemCost(item: string, amount: number)}
	{@const sbItem = items?.[item]}
	<div class="flex max-w-80 min-w-0 flex-row items-center gap-1">
		<span class="shrink-0 text-sm font-semibold">{amount}x</span>
		<div class="bg-background w-fit max-w-full min-w-0 rounded-sm border px-1">
			{#if sbItem?.item?.name}
				{@const itemDisplayName = sbItem.item.name
					.replace('Enchantment Ultimate', '')
					.replace('Enchantment ', '')}
				<div class="flex max-w-full min-w-0 flex-row items-center gap-1">
					<ItemRender skyblockId={item} class="size-6 shrink-0" />
					<ScrollingName class="w-fit max-w-full min-w-0 text-sm" title={itemDisplayName}>
						<ItemName name={itemDisplayName} />
					</ScrollingName>
				</div>
			{:else}
				<!-- Replace underscores with spaces and capitalize first letter of each word -->
				{@const itemName = item
					.replace(/_/g, ' ')
					.toLowerCase()
					.split(' ')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ')
					.replace('Enchantment ', '')}

				<ScrollingName class="w-fit max-w-full min-w-0 text-sm" title={itemName}>
					{itemName}
				</ScrollingName>
			{/if}
		</div>

		{#if sbItem?.auctions && sbItem.auctions.length > 0}
			{@const lowest = Math.min(...sbItem.auctions.map((a) => a.lowest))}
			<span class="dark:text-completed ml-1 shrink-0 text-sm whitespace-nowrap">
				{Math.round(lowest * amount).toLocaleString()}
			</span>
			<span class="text-muted-foreground shrink-0 whitespace-nowrap">coins</span>
		{:else if sbItem?.bazaar}
			{@const averageBuyOrder = sbItem.bazaar.averageBuyOrder}
			<span class="dark:text-completed ml-1 shrink-0 text-sm whitespace-nowrap">
				{Math.round(averageBuyOrder * amount).toLocaleString()}
			</span>
			<span class="text-muted-foreground shrink-0 whitespace-nowrap">coins</span>
		{/if}
	</div>
{/snippet}
