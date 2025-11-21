<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import type { PopularAuctionItemDto } from '$lib/api';

	interface Props {
		item: PopularAuctionItemDto;
		onclick?: (item: PopularAuctionItemDto) => void;
	}

	let { item, onclick }: Props = $props();
</script>

<div class="bg-card relative flex h-52 w-64 flex-col rounded-lg border p-3 transition-shadow hover:shadow-lg">
	<button
		class="dark bg-muted flex w-full flex-row items-center gap-2 rounded-md p-2"
		onclick={() => onclick?.(item)}
	>
		<ItemRender skyblockId={item.skyblockId} class="size-10" />
		<p class="text-left leading-none font-semibold"><FormattedText text={item.name ?? ''} /></p>
	</button>
	<div class="flex flex-1 flex-col justify-start p-1">
		<div class="flex flex-row justify-between">
			<span class="text-muted-foreground text-sm">Lowest BIN</span>
			<span class="font-bold">{item.lowestBinPrice?.toLocaleString() ?? 'N/A'}</span>
		</div>
		<div class="flex flex-row justify-between">
			<span class="text-muted-foreground text-sm">Sales (24h)</span>
			<span class="font-bold">{item.itemsSold.toLocaleString()}</span>
		</div>
	</div>

	<div class="bg-muted absolute right-2 bottom-2 rounded-md px-2 py-1 text-sm leading-none font-semibold select-none">
		POPULAR
	</div>
</div>
