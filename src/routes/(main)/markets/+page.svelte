<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import ItemDialog from '$comp/items/item-dialog.svelte';
	import PopularAuctionCard from '$comp/resources/auctions/popular-auction-card.svelte';
	import BazaarProductCard from '$comp/resources/bazaar/bazaar-product-card.svelte';
	import ItemSearch from '$comp/resources/item-search.svelte';
	import type { BazaarProductSummaryDto, ItemDto } from '$lib/api';
	import { getAuctions, getAuctionsOverview } from '$lib/remote/auctions.remote';
	import { getBazaarOverview, searchBazaarProducts } from '$lib/remote/bazaar.remote';
	import { Input } from '$ui/input';
	import { ScrollArea } from '$ui/scroll-area';
	import * as Tabs from '$ui/tabs';
	import EndedAuctionSkeleton from '../auctions/ended-auction-skeleton.svelte';
	import EndedAuction from '../auctions/ended-auction.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const bazaarOverview = getBazaarOverview();
	const auctionOverview = getAuctionsOverview();
	const popularAuctions = getAuctions();

	let search = $state('');
	let selectedItem = $state<ItemDto | null>(null);
	let open = $state(false);
	let products = $state<Array<BazaarProductSummaryDto & { productId: string }>>([]);
	let searchLoading = $state(false);
	let searchError = $state<string | null>(null);
	let searchRequestId = 0;

	const totalBazaarProducts = $derived(data.bazaarCount ?? 0);
	const totalAuctionItems = $derived(data.auctionCount ?? 0);

	$effect(() => {
		if (!browser) return;

		const query = search.trim();
		if (!query) {
			searchRequestId += 1;
			products = [];
			searchLoading = false;
			searchError = null;
			return;
		}

		const requestId = ++searchRequestId;
		searchLoading = true;
		searchError = null;

		const timer = setTimeout(async () => {
			try {
				const results = await searchBazaarProducts({ query, limit: 80 });
				if (requestId !== searchRequestId) return;
				products = results;
			} catch {
				if (requestId !== searchRequestId) return;
				products = [];
				searchError = 'Failed to search bazaar products.';
			} finally {
				if (requestId === searchRequestId) {
					searchLoading = false;
				}
			}
		}, 200);

		return () => clearTimeout(timer);
	});

	function itemPath(itemId: string): string {
		return `/markets/item/${encodeURIComponent(itemId)}`;
	}
</script>

<ItemDialog bind:open bind:selectedItem />

<main class="flex flex-col items-center">
	<section class="my-12 flex w-full max-w-5xl flex-col gap-6">
		<div class="space-y-2">
			<h1 class="text-4xl font-semibold">Markets</h1>
			<p class="text-muted-foreground">Track Bazaar and Auction House pricing.</p>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="bg-card rounded-lg border p-4">
				<p class="text-muted-foreground text-sm">Bazaar products</p>
				<p class="text-2xl font-semibold">{totalBazaarProducts.toLocaleString()}</p>
			</div>
			<div class="bg-card rounded-lg border p-4">
				<p class="text-muted-foreground text-sm">Auction item pools</p>
				<p class="text-2xl font-semibold">{totalAuctionItems.toLocaleString()}</p>
			</div>
		</div>

		<ItemSearch class="w-full" />
	</section>

	<Tabs.Root value="overview" class="w-full max-w-5xl">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
			<Tabs.Trigger value="bazaar">Bazaar</Tabs.Trigger>
			<Tabs.Trigger value="auctions">Auctions</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="overview" class="mt-6 space-y-8">
			<section>
				<h2 class="text-2xl font-semibold">Popular Auctions</h2>
				<ScrollArea class="mt-2 flex w-full" orientation="horizontal">
					<div class="flex flex-row items-center gap-2 py-3">
						{#await popularAuctions}
							{#each { length: 8 }}
								<EndedAuctionSkeleton />
							{/each}
						{:then data}
							{#each data?.items ?? [] as item, i (i)}
								<PopularAuctionCard
									{item}
									onclick={() => {
										goto(itemPath(item.skyblockId));
									}}
								/>
							{/each}
						{:catch}
							<div class="text-destructive px-2">Failed to load popular auctions.</div>
						{/await}
					</div>
				</ScrollArea>
			</section>

			<section>
				<h2 class="text-2xl font-semibold">Bazaar Highlights</h2>
				<div class="space-y-4">
					<div>
						<h3 class="text-lg font-medium">Top Movers</h3>
						<ScrollArea class="mt-2 flex w-full" orientation="horizontal">
							<div class="flex flex-row items-center gap-2 py-3">
								{#await bazaarOverview}
									{#each { length: 5 }}
										<div class="bg-muted h-32 w-64 animate-pulse rounded-lg"></div>
									{/each}
								{:then overview}
									{#each overview?.topMovers ?? [] as item (item.itemId)}
										<BazaarProductCard
											product={{ ...item.summary, productId: item.itemId }}
											onclick={() => {
												goto(itemPath(item.itemId));
											}}
										/>
									{/each}
								{/await}
							</div>
						</ScrollArea>
					</div>

					<div>
						<h3 class="text-lg font-medium">Most Traded</h3>
						<ScrollArea class="mt-2 flex w-full" orientation="horizontal">
							<div class="flex flex-row items-center gap-2 py-3">
								{#await bazaarOverview}
									{#each { length: 5 }}
										<div class="bg-muted h-32 w-64 animate-pulse rounded-lg"></div>
									{/each}
								{:then overview}
									{#each overview?.mostTraded ?? [] as item (item.itemId)}
										<BazaarProductCard
											product={{ ...item.summary, productId: item.itemId }}
											onclick={() => {
												goto(itemPath(item.itemId));
											}}
										/>
									{/each}
								{/await}
							</div>
						</ScrollArea>
					</div>
				</div>
			</section>
		</Tabs.Content>

		<Tabs.Content value="bazaar" class="mt-6 space-y-6">
			<div class="space-y-2">
				<h2 class="text-2xl font-semibold">Bazaar Directory</h2>
				<Input type="text" placeholder="Search bazaar products..." bind:value={search} />
			</div>

			{#if !search}
				<div class="space-y-4">
					<div>
						<h3 class="text-lg font-medium">Top Movers</h3>
						<ScrollArea class="mt-2 flex w-full" orientation="horizontal">
							<div class="flex flex-row items-center gap-2 py-3">
								{#await bazaarOverview}
									{#each { length: 5 }}
										<div class="bg-muted h-32 w-64 animate-pulse rounded-lg"></div>
									{/each}
								{:then overview}
									{#each overview?.topMovers ?? [] as item (item.itemId)}
										<BazaarProductCard
											product={{ ...item.summary, productId: item.itemId }}
											onclick={() => {
												goto(itemPath(item.itemId));
											}}
										/>
									{/each}
								{/await}
							</div>
						</ScrollArea>
					</div>

					<div>
						<h3 class="text-lg font-medium">Most Traded</h3>
						<ScrollArea class="mt-2 flex w-full" orientation="horizontal">
							<div class="flex flex-row items-center gap-2 py-3">
								{#await bazaarOverview}
									{#each { length: 5 }}
										<div class="bg-muted h-32 w-64 animate-pulse rounded-lg"></div>
									{/each}
								{:then overview}
									{#each overview?.mostTraded ?? [] as item (item.itemId)}
										<BazaarProductCard
											product={{ ...item.summary, productId: item.itemId }}
											onclick={() => {
												goto(itemPath(item.itemId));
											}}
										/>
									{/each}
								{/await}
							</div>
						</ScrollArea>
					</div>
				</div>
			{/if}

			{#if search.trim()}
				{#if searchLoading}
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{#each { length: 6 }}
							<div class="bg-muted h-32 w-full animate-pulse rounded-lg"></div>
						{/each}
					</div>
				{:else if searchError}
					<div class="text-destructive py-4">{searchError}</div>
				{:else}
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{#each products as product (product.productId)}
							<BazaarProductCard
								{product}
								onclick={() => {
									goto(itemPath(product.productId));
								}}
							/>
						{:else}
							<div class="text-muted-foreground col-span-full py-8 text-center">
								No bazaar products matched "{search.trim()}".
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</Tabs.Content>

		<Tabs.Content value="auctions" class="mt-6 space-y-8">
			<section>
				<h2 class="text-2xl font-semibold">New Auctions</h2>
				<ScrollArea class="mt-2 flex w-full" orientation="horizontal">
					<div class="flex flex-row items-center gap-2 py-3">
						{#await auctionOverview}
							{#each { length: 10 }}
								<EndedAuctionSkeleton />
							{/each}
						{:then overview}
							{#each overview?.new ?? [] as auction, i (i)}
								<EndedAuction
									{auction}
									onclick={() => {
										selectedItem = auction.item ?? null;
										open = true;
									}}
								/>
							{/each}
						{:catch}
							<div class="text-destructive px-2">Failed to load new auctions.</div>
						{/await}
					</div>
				</ScrollArea>
			</section>

			<section>
				<h2 class="text-2xl font-semibold">Recently Ended Auctions</h2>
				<ScrollArea class="mt-2 flex w-full" orientation="horizontal">
					<div class="flex flex-row items-center gap-2 py-3">
						{#await auctionOverview}
							{#each { length: 10 }}
								<EndedAuctionSkeleton />
							{/each}
						{:then overview}
							{#each overview?.ended ?? [] as auction, i (i)}
								<EndedAuction
									{auction}
									onclick={() => {
										selectedItem = auction.item ?? null;
										open = true;
									}}
								/>
							{/each}
						{:catch}
							<div class="text-destructive px-2">Failed to load ended auctions.</div>
						{/await}
					</div>
				</ScrollArea>
			</section>

			<section>
				<h2 class="text-2xl font-semibold">Popular Auctions</h2>
				<ScrollArea class="mt-2 flex w-full" orientation="horizontal">
					<div class="flex flex-row items-center gap-2 py-3">
						{#await popularAuctions}
							{#each { length: 8 }}
								<EndedAuctionSkeleton />
							{/each}
						{:then data}
							{#each data?.items ?? [] as item, i (i)}
								<PopularAuctionCard
									{item}
									onclick={() => {
										goto(itemPath(item.skyblockId));
									}}
								/>
							{/each}
						{:catch}
							<div class="text-destructive px-2">Failed to load popular auctions.</div>
						{/await}
					</div>
				</ScrollArea>
			</section>
		</Tabs.Content>
	</Tabs.Root>
</main>
