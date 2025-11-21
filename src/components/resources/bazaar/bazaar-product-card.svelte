<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import type { BazaarProductSummaryDto } from '$lib/api';

	interface Props {
		product: BazaarProductSummaryDto & { productId: string };
		onclick?: (product: BazaarProductSummaryDto & { productId: string }) => void;
	}

	let { product, onclick }: Props = $props();
</script>

<div class="bg-card relative flex h-52 w-64 flex-col rounded-lg border p-3 transition-shadow hover:shadow-lg">
	<button
		class="dark bg-muted flex w-full flex-row items-center gap-2 rounded-md p-2"
		onclick={() => onclick?.(product)}
	>
		<ItemRender skyblockId={product.productId} class="size-10" />
		<p class="text-left leading-none font-semibold"><FormattedText text={product.name ?? ''} /></p>
	</button>
	<div class="flex flex-1 flex-col justify-end p-1">
		<div class="flex flex-row justify-between">
			<span class="text-muted-foreground text-sm">Buy Price</span>
			<span class="font-bold">{product.buy?.toLocaleString()}</span>
		</div>
		<div class="flex flex-row justify-between">
			<span class="text-muted-foreground text-sm">Sell Price</span>
			<span class="font-bold">{product.sell?.toLocaleString()}</span>
		</div>
	</div>

	<div class="bg-muted absolute right-2 bottom-2 rounded-md px-2 py-1 text-sm leading-none font-semibold select-none">
		BAZAAR
	</div>
</div>
