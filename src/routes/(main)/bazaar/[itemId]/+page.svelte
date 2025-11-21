<script lang="ts">
	import { page } from '$app/state';
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import BazaarItemGraph from '$comp/resources/bazaar/bazaar-item-graph.svelte';
	import { formatItemIdToName } from '$lib/format';
	import { getBazaarItem } from '$lib/remote/bazaar.remote';
	import { getItemRelated } from '$lib/remote/items.remote';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const item = $derived(data.item);
	const itemData = getBazaarItem(page.params.itemId ?? '');
	const related = getItemRelated(page.params.itemId ?? '');
</script>

<main class="flex w-full max-w-5xl flex-col items-start gap-8 py-8">
	<div class="flex w-full flex-row items-center gap-4">
		{#if item}
			<ItemRender skyblockId={item.id} class="size-16" />
			<div class="flex flex-col">
				<h1 class="text-3xl font-bold">
					<FormattedText text={item.name ?? formatItemIdToName(item.id)} />
				</h1>
				<p class="text-muted-foreground">Bazaar Product</p>
			</div>
		{:else}
			<div class="bg-muted size-16 animate-pulse rounded-md"></div>
			<div class="flex flex-col gap-2">
				<div class="bg-muted h-8 w-48 animate-pulse rounded-md"></div>
				<div class="bg-muted h-4 w-24 animate-pulse rounded-md"></div>
			</div>
		{/if}
	</div>

	{#await itemData}
		<div class="flex h-[400px] w-full items-center justify-center">Loading item data...</div>
	{:then data}
		{@const buyVolume = data.product.orders?.buySummary?.reduce((acc, order) => acc + order.amount, 0) ?? 0}
		{@const sellVolume = data.product.orders?.sellSummary?.reduce((acc, order) => acc + order.amount, 0) ?? 0}
		<div class="flex w-full flex-col gap-4">
			<h2 class="text-xl font-semibold">Price History</h2>
			{#if data.history}
				<BazaarItemGraph history={data.history} />
			{:else}
				<div
					class="text-muted-foreground flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed"
				>
					No price history available.
				</div>
			{/if}

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="bg-card rounded-lg border p-4">
					<h3 class="mb-4 font-semibold">Buy Order</h3>
					<div class="flex flex-col gap-2">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Price</span>
							<span class="font-bold">{data.product.buyOrder?.toLocaleString()}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Volume</span>
							<span class="font-bold">{buyVolume.toLocaleString()}</span>
						</div>
					</div>
				</div>
				<div class="bg-card rounded-lg border p-4">
					<h3 class="mb-4 font-semibold">Sell Order</h3>
					<div class="flex flex-col gap-2">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Price</span>
							<span class="font-bold">{data.product.sellOrder?.toLocaleString()}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Volume</span>
							<span class="font-bold">{sellVolume.toLocaleString()}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div class="bg-card rounded-lg border p-4">
					<h3 class="mb-2 font-semibold">Trends</h3>
					{#await related}
						<div class="flex flex-col gap-2">
							<div class="bg-muted h-4 w-24 animate-pulse rounded-md"></div>
							<div class="bg-muted h-4 w-24 animate-pulse rounded-md"></div>
						</div>
					{:then data}
						{#if data?.trends}
							<div class="flex flex-col gap-2">
								<div class="flex justify-between">
									<span class="text-muted-foreground text-sm">Price Change</span>
									<span
										class={data.trends.priceChangePercentage >= 0
											? 'text-green-500'
											: 'text-red-500'}
									>
										{data.trends.priceChangePercentage > 0
											? '+'
											: ''}{data.trends.priceChangePercentage.toFixed(2)}%
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground text-sm">Volume Change</span>
									<span
										class={data.trends.volumeChangePercentage >= 0
											? 'text-green-500'
											: 'text-red-500'}
									>
										{data.trends.volumeChangePercentage > 0
											? '+'
											: ''}{data.trends.volumeChangePercentage.toFixed(2)}%
									</span>
								</div>
							</div>
						{:else}
							<p class="text-muted-foreground text-sm">No trend data available.</p>
						{/if}
					{:catch}
						<p class="text-destructive text-sm">Error loading trends.</p>
					{/await}
				</div>
				<div class="bg-card rounded-lg border p-4">
					<h3 class="mb-2 font-semibold">Similar Items</h3>
					{#await related}
						<div class="flex flex-wrap gap-2">
							{#each { length: 3 }}
								<div class="bg-muted size-8 animate-pulse rounded-sm"></div>
							{/each}
						</div>
					{:then data}
						<div class="flex flex-wrap gap-2">
							{#each data?.similar ?? [] as item (item.id)}
								<a
									href="/bazaar/{item.id}"
									class="bg-muted hover:bg-muted/80 flex items-center justify-center rounded-md p-1 transition-colors"
									title={item.name ?? item.id}
								>
									<ItemRender skyblockId={item.id ?? ''} class="size-8" />
								</a>
							{:else}
								<p class="text-muted-foreground text-sm">No similar items found.</p>
							{/each}
						</div>
					{:catch}
						<p class="text-destructive text-sm">Error loading similar items.</p>
					{/await}
				</div>
				<div class="bg-muted/50 flex items-center justify-center rounded-lg border border-dashed p-4">
					<span class="text-muted-foreground text-sm">Ad Placement</span>
				</div>
			</div>
		</div>
	{:catch error}
		<div class="text-destructive">Error loading item data: {error.message}</div>
	{/await}
</main>
