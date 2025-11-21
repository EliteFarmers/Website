<script lang="ts">
	import { goto } from '$app/navigation';
	import BazaarProductCard from '$comp/resources/bazaar/bazaar-product-card.svelte';
	import type { BazaarProductSummaryDto } from '$lib/api';
	import { getBazaarOverview } from '$lib/remote/bazaar.remote';
	import { Input } from '$ui/input';
	import { ScrollArea } from '$ui/scroll-area';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let search = $state('');

	const overview = getBazaarOverview();

	// Convert products map to array and filter
	const products = $derived<Array<BazaarProductSummaryDto & { productId: string }>>(
		Object.entries(data.products ?? {})
			.map(([productId, product]) => ({ ...product, productId }))
			.filter((p) => {
				if (!search) return true;
				return (
					(p.name ?? p.productId).toLowerCase().includes(search.toLowerCase()) ||
					p.productId.toLowerCase().includes(search.toLowerCase())
				);
			})
			.slice(0, 100) // Limit to 100 items for performance
	);
</script>

<main class="flex flex-col items-center">
	<h1 class="my-16 text-4xl">Bazaar</h1>

	<div class="mb-8 w-full max-w-2xl">
		<Input type="text" placeholder="Search bazaar..." bind:value={search} />
	</div>

	{#if !search}
		<h2 class="w-full max-w-5xl text-left text-2xl">Top Movers</h2>
		<ScrollArea class="flex max-w-5xl" orientation="horizontal">
			<div class="flex flex-row items-center gap-2 py-3">
				{#await overview}
					{#each { length: 5 }}
						<div class="bg-muted h-52 w-64 animate-pulse rounded-lg"></div>
					{/each}
				{:then data}
					{#each data?.topMovers ?? [] as item (item.itemId)}
						<BazaarProductCard
							product={{ ...item.summary, productId: item.itemId }}
							onclick={() => {
								goto(`/bazaar/${item.itemId}`);
							}}
						/>
					{/each}
				{/await}
			</div>
		</ScrollArea>

		<h2 class="w-full max-w-5xl text-left text-2xl">Most Traded</h2>
		<ScrollArea class="flex max-w-5xl" orientation="horizontal">
			<div class="flex flex-row items-center gap-2 py-3">
				{#await overview}
					{#each { length: 5 }}
						<div class="bg-muted h-52 w-64 animate-pulse rounded-lg"></div>
					{/each}
				{:then data}
					{#each data?.mostTraded ?? [] as item (item.itemId)}
						<BazaarProductCard
							product={{ ...item.summary, productId: item.itemId }}
							onclick={() => {
								goto(`/bazaar/${item.itemId}`);
							}}
						/>
					{/each}
				{/await}
			</div>
		</ScrollArea>

		<h2 class="mt-8 w-full max-w-5xl text-left text-2xl">All Products</h2>
	{/if}

	<div class="flex w-full max-w-5xl flex-wrap justify-center gap-4">
		{#each products as product (product.productId)}
			<BazaarProductCard
				{product}
				onclick={() => {
					goto(`/bazaar/${product.productId}`);
				}}
			/>
		{:else}
			<div class="text-muted-foreground">No products found.</div>
		{/each}
	</div>
</main>
