<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemDialog from '$comp/items/item-dialog.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import AuctionItemGraph from '$comp/resources/auctions/auction-item-graph.svelte';
	import BazaarItemGraph from '$comp/resources/bazaar/bazaar-item-graph.svelte';
	import type { ItemDto } from '$lib/api';
	import { formatItemIdToName } from '$lib/format';
	import { getItemEndedAuctionsByVariant } from '$lib/remote/auctions.remote';
	import { ScrollArea } from '$ui/scroll-area';
	import * as Select from '$ui/select';
	import EndedAuction from '../../../auctions/ended-auction.svelte';
	import EndedAuctionSkeleton from '../../../auctions/ended-auction-skeleton.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let selectedVariant = $state<string | undefined>(undefined);
	let variantInitialized = $state(false);
	let selectedItem = $state<ItemDto | null>(null);
	let open = $state(false);

	const variantQueryValue = $derived.by(() => {
		if (!selectedVariant || selectedVariant === 'default') return undefined;
		return selectedVariant;
	});

	const endedAuctions = $derived.by(() => {
		if (!data.auctionData) return null;
		if (!variantQueryValue) return data.endedAuctions;
		return getItemEndedAuctionsByVariant({
			itemId: data.itemId,
			variant: variantQueryValue,
			limit: 10,
		});
	});

	$effect(() => {
		if (variantInitialized) return;
		selectedVariant = data.initialVariant;
		variantInitialized = true;
	});

	$effect(() => {
		if (!variantInitialized) return;
		const currentVariant = page.url.searchParams.get('variant') ?? undefined;
		if (currentVariant === variantQueryValue) return;

		const nextUrl = new URL(page.url);
		if (variantQueryValue) {
			nextUrl.searchParams.set('variant', variantQueryValue);
		} else {
			nextUrl.searchParams.delete('variant');
		}

		goto(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true,
			invalidateAll: false,
		});
	});
</script>

<ItemDialog bind:open bind:selectedItem />

<main class="flex w-full max-w-6xl flex-col gap-8 py-8">
	<div class="flex w-full flex-row items-center gap-4">
		{#await data.item}
			<div class="bg-muted size-16 animate-pulse rounded-md"></div>
			<div class="flex flex-col gap-2">
				<div class="bg-muted h-8 w-56 animate-pulse rounded-md"></div>
				<div class="bg-muted h-4 w-40 animate-pulse rounded-md"></div>
			</div>
		{:then itemData}
			<ItemRender skyblockId={itemData?.item?.id ?? data.itemId} class="size-16" />
			<div class="flex flex-col">
				<h1 class="text-3xl font-semibold">
					<FormattedText text={itemData?.item?.name ?? formatItemIdToName(data.itemId)} />
				</h1>
				<p class="text-muted-foreground">
					{itemData?.item?.category ?? 'Cross-market item'}
				</p>
			</div>
		{/await}
	</div>

	<section class="space-y-3">
		{#await Promise.all([data.auctionData, data.bazaarData])}
			<div class="bg-muted/20 text-muted-foreground flex h-[400px] items-center justify-center rounded-lg border border-dashed">
				Loading market history...
			</div>
		{:then [auctionData, bazaarData]}
			{@const auctionPointCount =
				auctionData
					? Math.max(
							0,
							...Object.values(auctionData.history ?? {}).map((entry) => entry?.history?.length ?? 0)
						)
					: 0}
			{@const bazaarPointCount = bazaarData?.history?.history?.length ?? 0}
			{@const primaryMarket =
				auctionPointCount > 0 && auctionPointCount >= bazaarPointCount
					? 'auction'
					: bazaarPointCount > 0
						? 'bazaar'
						: 'none'}

			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold">
					{#if primaryMarket === 'auction'}
						Auction History
					{:else if primaryMarket === 'bazaar'}
						Bazaar History
					{:else}
						Market History
					{/if}
				</h2>

				{#if primaryMarket === 'auction' && auctionData && auctionData.variants.length > 1}
					<Select.Root
						type="single"
						value={selectedVariant ?? auctionData.variants[0]?.variantKey ?? 'default'}
						onValueChange={(value) => (selectedVariant = value)}
					>
						<Select.Trigger class="w-[240px]">
							{auctionData.variants.find(
								(variant) =>
									(variant.variantKey ?? 'default') ===
									(selectedVariant ?? auctionData.variants[0]?.variantKey ?? 'default')
							)?.variantKey ?? 'Default'}
						</Select.Trigger>
						<Select.Content>
							{#each auctionData.variants as variant (variant.variantKey)}
								<Select.Item
									value={variant.variantKey ?? 'default'}
									label={variant.variantKey ?? 'Default'}
								/>
							{/each}
						</Select.Content>
					</Select.Root>
				{/if}
			</div>

			{#if primaryMarket === 'auction' && auctionData}
				<AuctionItemGraph histories={auctionData.history} variant={selectedVariant} />
			{:else if primaryMarket === 'bazaar' && bazaarData?.history}
				<BazaarItemGraph history={bazaarData.history} />
			{:else}
				<div class="text-muted-foreground flex h-[400px] items-center justify-center rounded-lg border border-dashed">
					No market history found for this item.
				</div>
			{/if}
		{/await}
	</section>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<div class="bg-card rounded-lg border p-4">
			<h3 class="mb-2 font-semibold">Trends</h3>
			{#await data.related}
				<div class="space-y-2">
					<div class="bg-muted h-4 w-28 animate-pulse rounded-md"></div>
					<div class="bg-muted h-4 w-28 animate-pulse rounded-md"></div>
				</div>
			{:then related}
				{#if related?.trends}
					<div class="space-y-2">
						<div class="flex justify-between">
							<span class="text-muted-foreground text-sm">Price change</span>
							<span
								class={related.trends.priceChangePercentage >= 0 ? 'text-green-500' : 'text-red-500'}
							>
								{related.trends.priceChangePercentage > 0 ? '+' : ''}{related.trends.priceChangePercentage.toFixed(2)}%
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground text-sm">Volume change</span>
							<span
								class={related.trends.volumeChangePercentage >= 0 ? 'text-green-500' : 'text-red-500'}
							>
								{related.trends.volumeChangePercentage > 0 ? '+' : ''}{related.trends.volumeChangePercentage.toFixed(2)}%
							</span>
						</div>
					</div>
				{:else}
					<p class="text-muted-foreground text-sm">No trend data available.</p>
				{/if}
			{:catch}
				<p class="text-destructive text-sm">Failed to load trend data.</p>
			{/await}
		</div>

		<div class="bg-card rounded-lg border p-4">
			<h3 class="mb-2 font-semibold">Similar Items</h3>
			{#await data.related}
				<div class="flex flex-wrap gap-2">
					{#each { length: 6 }}
						<div class="bg-muted size-8 animate-pulse rounded-sm"></div>
					{/each}
				</div>
			{:then related}
				<div class="flex flex-wrap gap-2">
					{#each related?.similar ?? [] as similarItem (similarItem.id)}
						{#if similarItem.id}
							<a
								href="/markets/item/{encodeURIComponent(similarItem.id)}"
								class="bg-muted hover:bg-muted/80 flex items-center justify-center rounded-md p-1 transition-colors"
								title={similarItem.name ?? similarItem.id}
							>
								<ItemRender skyblockId={similarItem.id} class="size-8" />
							</a>
						{/if}
					{:else}
						<p class="text-muted-foreground text-sm">No similar items found.</p>
					{/each}
				</div>
			{:catch}
				<p class="text-destructive text-sm">Failed to load similar items.</p>
			{/await}
		</div>

		{#await Promise.all([data.auctionData, data.bazaarData]) then [auctionData, bazaarData]}
			{@const key = selectedVariant ?? auctionData?.variants[0]?.variantKey ?? 'default'}
			{@const fallbackKey = auctionData ? Object.keys(auctionData.history)[0] : undefined}
			{@const history =
				auctionData
					? (auctionData.history[key]?.history ?? auctionData.history[fallbackKey ?? '']?.history ?? [])
					: []}
			{@const latest = history.at(-1)}

			{#if latest || bazaarData}
				<div class="bg-card rounded-lg border p-4">
					<h3 class="mb-2 font-semibold">Market Snapshot</h3>
					<div class="space-y-3">
						{#if latest}
							<div class="space-y-1">
								<p class="text-muted-foreground text-sm">Lowest BIN</p>
								<p class="font-semibold">{latest.lowestBinPrice?.toLocaleString() ?? 'N/A'}</p>
							</div>
							<div class="space-y-1">
								<p class="text-muted-foreground text-sm">Average Sale</p>
								<p class="font-semibold">{latest.averageSalePrice?.toLocaleString() ?? 'N/A'}</p>
							</div>
						{/if}

						{#if bazaarData}
							<div class="space-y-1">
								<p class="text-muted-foreground text-sm">Buy Order</p>
								<p class="font-semibold">{bazaarData.product.buyOrder?.toLocaleString() ?? 'N/A'}</p>
							</div>
							<div class="space-y-1">
								<p class="text-muted-foreground text-sm">Sell Order</p>
								<p class="font-semibold">{bazaarData.product.sellOrder?.toLocaleString() ?? 'N/A'}</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		{/await}
	</div>

	{#await data.bazaarData then bazaarData}
		{#if bazaarData?.product?.orders}
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">Bazaar Order Book</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="overflow-hidden rounded-md border">
						<div class="bg-muted px-4 py-3">
							<h3 class="font-semibold">Top Buy Orders</h3>
						</div>
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="text-muted-foreground border-b text-left">
										<th class="px-4 py-2 font-medium">Price</th>
										<th class="px-4 py-2 text-right font-medium">Amount</th>
										<th class="px-4 py-2 text-right font-medium">Orders</th>
									</tr>
								</thead>
								<tbody>
									{#each bazaarData.product.orders.buySummary?.slice(0, 10) ?? [] as order (order.pricePerUnit)}
										<tr class="border-b last:border-b-0">
											<td class="px-4 py-2">{order.pricePerUnit.toLocaleString()}</td>
											<td class="px-4 py-2 text-right">{order.amount.toLocaleString()}</td>
											<td class="px-4 py-2 text-right">{order.orders.toLocaleString()}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					<div class="overflow-hidden rounded-md border">
						<div class="bg-muted px-4 py-3">
							<h3 class="font-semibold">Top Sell Orders</h3>
						</div>
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="text-muted-foreground border-b text-left">
										<th class="px-4 py-2 font-medium">Price</th>
										<th class="px-4 py-2 text-right font-medium">Amount</th>
										<th class="px-4 py-2 text-right font-medium">Orders</th>
									</tr>
								</thead>
								<tbody>
									{#each bazaarData.product.orders.sellSummary?.slice(0, 10) ?? [] as order (order.pricePerUnit)}
										<tr class="border-b last:border-b-0">
											<td class="px-4 py-2">{order.pricePerUnit.toLocaleString()}</td>
											<td class="px-4 py-2 text-right">{order.amount.toLocaleString()}</td>
											<td class="px-4 py-2 text-right">{order.orders.toLocaleString()}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</section>
		{/if}
	{/await}

	<section class="space-y-3">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-semibold">Recently Ended Auctions</h2>
			{#if variantQueryValue}
				<p class="text-muted-foreground text-sm">Filtered by variant: {variantQueryValue}</p>
			{/if}
		</div>

		<ScrollArea class="w-full rounded-md border" orientation="horizontal">
			<div class="flex flex-row items-center gap-2 p-4">
				{#await endedAuctions}
					{#each { length: 5 }}
						<EndedAuctionSkeleton />
					{/each}
				{:then auctions}
					{#each auctions ?? [] as auction (auction.auctionId)}
						<EndedAuction
							{auction}
							onclick={() => {
								selectedItem = auction.item ?? null;
								open = true;
							}}
						/>
					{:else}
						<p class="text-muted-foreground px-2">No recently ended auctions found.</p>
					{/each}
				{:catch}
					<p class="text-destructive px-2">Failed to load recently ended auctions.</p>
				{/await}
			</div>
		</ScrollArea>
	</section>
</main>
