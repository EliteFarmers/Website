<script lang="ts">
	import PlayerSearch from '$comp/player-search.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import type { ProductDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getTebex } from '$lib/tebex/index.svelte';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import Gift from '@lucide/svelte/icons/gift';
	import Package from '@lucide/svelte/icons/package';
	import Search from '@lucide/svelte/icons/search';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import ShopBasketItem from './shop-basket-item.svelte';

	interface Props {
		products: ProductDto[];
		open: boolean;
		onOpenChange?: (open: boolean) => void;
	}

	let { products, open = $bindable(false), onOpenChange }: Props = $props();

	const tebex = getTebex();
	const gbl = getGlobalContext();

	const checkoutItems = $derived.by(() => {
		const items = tebex.currentCheckout?.checkoutRequest.items ?? [];
		return items.map((item) => {
			const product = products.find((p) => p.id === item.productId);
			return { ...item, product };
		});
	});

	const totalPrice = $derived(tebex.currentCheckout?.totalPrice ?? null);

	let giftMode = $state(false);
	let giftRecipient = $state<string | null>(null);
	let settingRecipient = $state(false);
	let giftSearchOpen = $state(false);
	let giftSearchValue = $state('');

	const selfIgn = $derived(gbl?.session?.ign ?? null);

	async function selectRecipient(ign: string) {
		giftRecipient = ign;
		giftSearchOpen = false;
		giftSearchValue = '';

		settingRecipient = true;
		try {
			await tebex.setRecipient(ign);
		} finally {
			settingRecipient = false;
		}
	}

	async function clearGift() {
		giftMode = false;
		giftRecipient = null;
		giftSearchOpen = false;
		giftSearchValue = '';

		settingRecipient = true;
		try {
			await tebex.setRecipient(null);
		} finally {
			settingRecipient = false;
		}
	}

	async function removeItem(productId: string) {
		await tebex.removeFromCheckout(productId);
		if (!tebex.currentCheckout) {
			open = false;
		}
	}
</script>

<Dialog.Root bind:open {onOpenChange}>
	<Dialog.ScrollContent>
		<Dialog.Header>
			<Dialog.Title class="mb-2 flex items-center gap-2 text-xl">
				<ShoppingCart class="size-5" />
				Your Basket ({checkoutItems.length}
				{checkoutItems.length === 1 ? 'Item' : 'Items'})
			</Dialog.Title>
		</Dialog.Header>

		{#if checkoutItems.length === 0}
			<div class="flex flex-col items-center gap-3 py-8">
				<Package class="text-muted-foreground size-12" />
				<p class="text-muted-foreground text-sm">Your basket is empty.</p>
				<Button variant="outline" onclick={() => (open = false)}>Continue Shopping</Button>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				{#each checkoutItems as item (item.productId)}
					<ShopBasketItem
						product={item.product}
						productAction={tebex.getProductAction(item.productId)}
						canRemove={tebex.currentCheckout?.canMutate ?? false}
						onremove={() => removeItem(item.productId)}
						compact
					/>
				{/each}
			</div>

			<!-- Gift / Recipient section -->
			<div class="border-border mt-3 border-t pt-3">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium">Buying for</span>
					{#if !giftMode}
						<Button variant="ghost" size="sm" class="gap-1.5 text-xs" onclick={() => (giftMode = true)}>
							<Gift class="size-3.5" />
							Send as gift
						</Button>
					{:else if giftRecipient}
						<Button
							variant="ghost"
							size="sm"
							class="text-xs"
							onclick={clearGift}
							disabled={settingRecipient}
						>
							Cancel gift
						</Button>
					{:else}
						<Button
							variant="ghost"
							size="sm"
							class="text-xs"
							onclick={clearGift}
							disabled={settingRecipient}
						>
							Cancel
						</Button>
					{/if}
				</div>

				{#if !giftMode}
					<!-- Self checkout -->
					{#if selfIgn}
						<div class="mt-2 flex items-center gap-2">
							<PlayerHead uuid={selfIgn} class="size-7 rounded-sm" />
							<span class="text-sm font-medium">{selfIgn}</span>
							<span class="text-muted-foreground text-xs">(you)</span>
						</div>
					{:else}
						<p class="text-muted-foreground mt-1 text-sm">Yourself</p>
					{/if}
				{:else if giftRecipient}
					<!-- Gift recipient selected -->
					<div class="mt-2 flex items-center gap-2">
						<PlayerHead uuid={giftRecipient} class="size-7 rounded-sm" />
						<span class="text-sm font-medium">{giftRecipient}</span>
						{#if settingRecipient}
							<span class="text-muted-foreground text-xs">(updating...)</span>
						{/if}
					</div>
				{:else}
					<!-- Gift search -->
					<Button variant="outline" class="mt-2 w-full justify-start" onclick={() => (giftSearchOpen = true)}>
						<Search class="size-4" />
						Search for a player
					</Button>
				{/if}
			</div>

			<div class="border-border mt-2 border-t pt-4">
				<div class="flex items-center justify-between">
					<span class="text-lg font-semibold">Total</span>
					{#if totalPrice === null}
						<span class="text-muted-foreground text-sm font-medium">Updating...</span>
					{:else}
						<span class="text-lg font-bold">${totalPrice.toFixed(2)}</span>
					{/if}
				</div>
			</div>

			<Dialog.Footer class="mt-4 flex-col gap-2 sm:flex-col">
				<Button class="w-full font-semibold" size="lg" href="/shop/checkout" onclick={() => (open = false)}>
					<ShoppingCart class="size-4" />
					Continue to Checkout
				</Button>
				<Button variant="outline" class="w-full" onclick={() => (open = false)}>Continue Shopping</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>

<PlayerSearch useButton={false} bind:open={giftSearchOpen} bind:search={giftSearchValue} cmd={selectRecipient} />
