<script lang="ts">
	import Head from '$comp/seo/head.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	const auction = $derived(data.auction);
	const itemName = $derived(auction.item?.name ?? auction.skyblockId?.replaceAll('_', ' ') ?? 'Auction item');
	const soldAt = $derived(auction.soldAt ? new Date(Number(auction.soldAt)).toLocaleString() : undefined);
</script>

<Head title={itemName} description="Auction details" />

<section class="mx-auto my-12 flex w-full max-w-3xl flex-col gap-6 px-4">
	<div class="flex items-start gap-4">
		{#if auction.skyblockId}
			<ItemRender skyblockId={auction.skyblockId} class="size-14" />
		{/if}
		<div>
			<h1 class="text-3xl font-semibold">{itemName}</h1>
			<p class="text-muted-foreground text-sm">Auction {auction.auctionId}</p>
		</div>
	</div>

	<div class="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
		<div>
			<div class="text-muted-foreground text-sm">Sold price</div>
			<div class="text-xl font-semibold">{Number(auction.price).toLocaleString()} coins</div>
		</div>
		<div>
			<div class="text-muted-foreground text-sm">Sold at</div>
			<div class="text-xl font-semibold">{soldAt ?? 'Unknown'}</div>
		</div>
		<div>
			<div class="text-muted-foreground text-sm">Seller UUID</div>
			<div class="text-sm break-all">{auction.sellerUuid}</div>
		</div>
		<div>
			<div class="text-muted-foreground text-sm">Buyer UUID</div>
			<div class="text-sm break-all">{auction.buyerUuid ?? 'Unknown'}</div>
		</div>
	</div>
</section>
