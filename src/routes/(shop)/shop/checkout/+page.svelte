<script lang="ts">
	import { page } from '$app/state';
	import Head from '$comp/head.svelte';
	import ShopBasketItem from '$comp/shop/shop-basket-item.svelte';
	import ShopGiftRecipient from '$comp/shop/shop-gift-recipient.svelte';
	import ShopOrderSummary from '$comp/shop/shop-order-summary.svelte';
	import { env } from '$env/dynamic/public';
	import { buildShopCheckoutLdJson, shopKeywords } from '$lib/shop/seo';
	import { Button } from '$ui/button';
	import Gift from '@lucide/svelte/icons/gift';
	import Package from '@lucide/svelte/icons/package';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import UserRound from '@lucide/svelte/icons/user-round';
	import X from '@lucide/svelte/icons/x';
	import type { PageData } from './$types';
	import { CheckoutState } from './checkout.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const checkout = new CheckoutState(
		() => data.products,
		() => page.url
	);

	const baseUrl = env.PUBLIC_CANONICAL_URL || env.PUBLIC_HOST_URL || '';
	const ldJson = buildShopCheckoutLdJson(baseUrl);
</script>

<Head
	title="Checkout | Elite Shop"
	description="Review your Elite Shop basket, confirm the recipient, and continue to checkout."
	keywords={shopKeywords}
	canonicalPath="/shop/checkout"
	twitterCardType="summary"
	{ldJson}
/>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
	<section class="space-y-4">
		<div class="space-y-3">
			<p class="text-primary text-sm font-semibold tracking-[0.2em] uppercase">Checkout</p>
			<h1 class="max-w-3xl text-4xl font-black tracking-tight text-balance sm:text-5xl">
				{checkout.checkoutPageTitle}
			</h1>
			<p class="text-muted-foreground max-w-3xl text-base leading-relaxed sm:text-lg">
				{checkout.checkoutPageDescription}
			</p>
		</div>

		{#if !checkout.showingCheckoutSuccess && !checkout.showingCheckoutError && checkout.giftIntent === 'gift'}
			<div class="border-border/60 bg-card/80 flex flex-wrap items-center gap-3 rounded-3xl border p-4 shadow-sm">
				<div class="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
					<Gift class="size-5" />
				</div>
				<div>
					<p class="font-semibold">This order is set up as a gift.</p>
					<p class="text-muted-foreground text-sm">
						{#if checkout.effectiveRecipientIgn}
							The items in this basket will go to <span class="text-foreground font-medium"
								>{checkout.effectiveRecipientIgn}</span
							>.
						{:else}
							Choose a recipient before you continue to Tebex.
						{/if}
					</p>
				</div>
			</div>
		{:else if !checkout.showingCheckoutSuccess && !checkout.showingCheckoutError && checkout.isGiftCheckout}
			<div class="border-border/60 bg-card/80 flex flex-wrap items-center gap-3 rounded-3xl border p-4 shadow-sm">
				<div class="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
					<UserRound class="size-5" />
				</div>
				<div>
					<p class="font-semibold">This order will be switched back to your account.</p>
					<p class="text-muted-foreground text-sm">
						It is currently saved as a gift for <span class="text-foreground font-medium"
							>{checkout.effectiveRecipientIgn}</span
						>, but continuing will update it to self checkout first.
					</p>
				</div>
			</div>
		{/if}
	</section>

	{#if checkout.showingCheckoutSuccess}
		<section
			class="border-border/60 bg-card/70 flex flex-col items-center gap-5 rounded-4xl border px-6 py-14 text-center shadow-sm"
		>
			<div class="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-3xl">
				<Gift class="size-8" />
			</div>
			<div class="space-y-2">
				<h2 class="text-3xl font-black tracking-tight">Thanks for your order.</h2>
				<p class="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
					Your checkout was submitted through Tebex. Purchases usually appear in your history shortly after
					processing finishes.
				</p>
			</div>
			<div class="flex w-full max-w-md flex-col gap-3 sm:flex-row">
				<Button href="/profile/purchases" size="lg" class="flex-1">View Purchases</Button>
				<Button href="/shop" variant="outline" size="lg" class="flex-1">Back to Shop</Button>
			</div>
		</section>
	{:else if checkout.showingCheckoutError}
		<section
			class="border-border/60 bg-card/70 flex flex-col items-center gap-5 rounded-4xl border px-6 py-14 text-center shadow-sm"
		>
			<div class="bg-destructive/10 text-destructive flex size-16 items-center justify-center rounded-3xl">
				<X class="size-8" />
			</div>
			<div class="space-y-2">
				<h2 class="text-3xl font-black tracking-tight">Payment did not go through.</h2>
				<p class="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
					You can reopen Tebex checkout and try again, or return to your basket to make changes first.
				</p>
			</div>
			<div class="flex w-full max-w-md flex-col gap-3 sm:flex-row">
				<Button
					size="lg"
					class="flex-1"
					onclick={() => checkout.proceedToCheckout()}
					disabled={checkout.launchingCheckout}
				>
					<ShoppingCart class="size-4" />
					Try Checkout Again
				</Button>
				<Button variant="outline" size="lg" class="flex-1" onclick={() => checkout.returnToBasket()}>
					Return to Basket
				</Button>
			</div>
		</section>
	{:else if !checkout.hasCheckoutToReview}
		<section
			class="border-border/60 bg-card/70 flex flex-col items-center gap-4 rounded-4xl border px-6 py-12 text-center shadow-sm"
		>
			<div class="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-3xl">
				<Package class="size-8" />
			</div>
			<div class="space-y-2">
				<h2 class="text-2xl font-black tracking-tight">Your basket is empty.</h2>
				<p class="text-muted-foreground max-w-lg text-sm leading-relaxed sm:text-base">
					Add something from the shop first, then come back here to confirm the order and recipient.
				</p>
			</div>
			<Button href="/shop" size="lg">Back to Shop</Button>
		</section>
	{:else}
		<div class="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_22rem]">
			<div class="flex flex-col gap-8">
				<section class="border-border/60 bg-card/70 rounded-4xl border p-6 shadow-sm sm:p-8">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 class="text-2xl font-black tracking-tight">Your basket</h2>
							<p class="text-muted-foreground mt-1 text-sm leading-relaxed">
								{checkout.basketItemCount}
								{checkout.basketItemCount === 1 ? 'item' : 'items'} in this order.
							</p>
						</div>
						<Button href="/shop" variant="outline">Keep Shopping</Button>
					</div>

					<div class="mt-6 flex flex-col gap-3">
						{#each checkout.basketItems as item (item.productId)}
							<ShopBasketItem
								product={item.product}
								productAction={checkout.getProductAction(item.productId)}
								canRemove={item.isPendingPlaceholder
									? !checkout.addingPendingGiftProduct
									: checkout.canMutateCheckout}
								onremove={() =>
									item.isPendingPlaceholder
										? checkout.clearPendingGiftProductPrompt()
										: checkout.removeItem(item.productId)}
								pending={item.isPendingPlaceholder}
								pendingLabel="Pending gift item"
								description={checkout.itemDescription(item)}
							/>
						{/each}
					</div>
				</section>

				<ShopGiftRecipient
					giftIntent={checkout.giftIntent}
					effectiveRecipientIgn={checkout.effectiveRecipientIgn}
					selfCheckoutUnavailable={checkout.selfCheckoutUnavailable}
					hasNonGiftableItemsForGift={checkout.hasNonGiftableItemsForGift}
					settingRecipient={checkout.settingRecipient}
					editingGiftRecipient={checkout.editingGiftRecipient}
					onchooseself={() => checkout.chooseSelf()}
					onchoosegift={() => checkout.chooseGift()}
					onselectrecipient={(ign) => checkout.selectRecipient(ign)}
					onstartchanging={() => checkout.startChangingRecipient()}
					onstopchanging={() => checkout.stopChangingRecipient()}
					oncleargift={() => checkout.clearGift()}
				/>
			</div>

			<aside class="lg:sticky lg:top-28 lg:self-start">
				<ShopOrderSummary
					totalPrice={checkout.totalPrice}
					totalPriceLabel={checkout.totalPriceLabel}
					basketItemCount={checkout.basketItemCount}
					deliveryLabel={checkout.deliveryLabel}
					deliveryDescription={checkout.deliveryDescription}
					checkoutStatusLabel={checkout.checkoutStatusLabel}
					giftIntent={checkout.giftIntent}
					canCheckout={checkout.canCheckout}
					oncheckout={() => checkout.proceedToCheckout()}
				/>
			</aside>
		</div>
	{/if}
</div>
