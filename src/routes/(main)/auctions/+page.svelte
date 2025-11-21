<script lang="ts">
	import { goto } from '$app/navigation';
	import ItemDialog from '$comp/items/item-dialog.svelte';
	import PopularAuctionCard from '$comp/resources/auctions/popular-auction-card.svelte';
	import ItemSearch from '$comp/resources/item-search.svelte';
	import type { ItemDto } from '$lib/api';
	import { getAuctions, getAuctionsOverview } from '$lib/remote/auctions.remote';
	import { ScrollArea } from '$ui/scroll-area';
	import EndedAuctionSkeleton from './ended-auction-skeleton.svelte';
	import EndedAuction from './ended-auction.svelte';

	const overview = getAuctionsOverview();
	const popular = getAuctions();

	let selectedItem = $state<ItemDto | null>(null);
	let open = $state(false);
</script>

<ItemDialog bind:open bind:selectedItem />

<main class="flex flex-col items-center">
	<h1 class="my-16 text-4xl">Auction House</h1>

	<ItemSearch class="mb-8 w-full max-w-2xl" />

	<h2 class="w-full max-w-5xl text-left text-2xl">New Auctions</h2>
	<ScrollArea class="flex max-w-5xl" orientation="horizontal">
		<div class="flex flex-row items-center gap-2 py-3">
			{#await overview}
				{#each { length: 10 }}
					<EndedAuctionSkeleton />
				{/each}
			{:then data}
				{#each data?.new ?? [] as auction, i (i)}
					<EndedAuction
						{auction}
						onclick={() => {
							selectedItem = auction.item ?? null;
							open = true;
						}}
					/>
				{/each}
			{:catch}
				<div>Error loading auctions!</div>
			{/await}
		</div>
	</ScrollArea>

	<h2 class="w-full max-w-5xl text-left text-2xl">Recently Ended Auctions</h2>
	<ScrollArea class="flex max-w-5xl" orientation="horizontal">
		<div class="flex flex-row items-center gap-2 py-3">
			{#await overview}
				{#each { length: 10 }}
					<EndedAuctionSkeleton />
				{/each}
			{:then data}
				{#each data?.ended ?? [] as auction, i (i)}
					<EndedAuction
						{auction}
						onclick={() => {
							selectedItem = auction.item ?? null;
							open = true;
						}}
					/>
				{/each}
			{:catch}
				<div>Error loading auctions!</div>
			{/await}
		</div>
	</ScrollArea>

	<h2 class="w-full max-w-5xl text-left text-2xl">Popular Auctions</h2>
	<ScrollArea class="flex max-w-5xl" orientation="horizontal">
		<div class="flex flex-row items-center gap-2 py-3">
			{#await popular}
				{#each { length: 10 }}
					<EndedAuctionSkeleton />
				{/each}
			{:then data}
				{#each data?.items ?? [] as item, i (i)}
					<PopularAuctionCard
						{item}
						onclick={() => {
							goto(`/auctions/${item.skyblockId}`);
						}}
					/>
				{/each}
			{:catch}
				<div>Error loading auctions!</div>
			{/await}
		</div>
	</ScrollArea>
</main>
