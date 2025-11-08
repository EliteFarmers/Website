<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import type { EndedAuctionDto } from '$lib/api';

	interface Props {
		auction: EndedAuctionDto;
		onclick?: (auction: EndedAuctionDto) => void;
	}

	let { auction, onclick }: Props = $props();
</script>

<div class="bg-card relative flex h-52 w-64 flex-col rounded-lg border p-3 transition-shadow hover:shadow-lg">
	<button
		class="dark bg-muted flex w-full flex-row items-center gap-2 rounded-md p-2"
		onclick={() => onclick?.(auction)}
	>
		<ItemRender
			skyblockId={auction.item?.petInfo?.type ?? auction.skyblockId ?? ''}
			class="size-10"
			pet={auction.item?.petInfo !== undefined}
		/>
		<p class="text-left leading-none font-semibold"><FormattedText text={auction.item?.name ?? ''} /></p>
	</button>
	<div class="p-1">
		<p class="text-muted-foreground text-sm">
			Ended at {new Date(Number(auction.timestamp)).toLocaleString()}
		</p>
		<p class="my-1"><strong>{auction.price.toLocaleString()} coins</strong></p>
	</div>

	<div class="flex h-full flex-1 flex-col justify-end">
		<div class="flex flex-row items-center gap-1 p-1" data-sveltekit-preload-data="tap">
			<PlayerHead class="size-5" uuid={auction.buyer?.id} />
			<p class="text-muted-foreground max-w-48 truncate text-sm">
				Bought by <a class="underline" href="/@{auction.buyerUuid}/{auction.buyerProfileUuid}"
					>{auction.buyer?.formattedName}</a
				>
			</p>
		</div>
		<div class="flex flex-row items-center gap-1 p-1">
			<PlayerHead class="size-5" uuid={auction.seller?.id} />
			<p class="text-muted-foreground max-w-40 truncate text-sm">
				Sold by <a class="underline" href="/@{auction.sellerUuid}/{auction.sellerProfileUuid}"
					>{auction.seller?.formattedName}</a
				>
			</p>
		</div>
	</div>

	{#if auction.bin}
		<div
			class="bg-muted absolute right-2 bottom-2 rounded-md px-2 py-1 text-sm leading-none font-semibold select-none"
		>
			BIN
		</div>
	{/if}
</div>
