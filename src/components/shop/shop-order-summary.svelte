<script lang="ts">
	import { Button } from '$ui/button';
	import Gift from '@lucide/svelte/icons/gift';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import type { CheckoutState } from '../../routes/(shop)/shop/checkout/checkout.svelte';

	let { checkout }: { checkout: CheckoutState } = $props();
</script>

<section class="rounded-4xl border border-border/60 bg-card/80 p-6 shadow-sm sm:p-8">
	<h2 class="text-2xl font-black tracking-tight">Order Summary</h2>

	<div class="mt-6 space-y-4">
		<div class="rounded-3xl border bg-background/70 p-4">
			<div class="flex flex-row items-center gap-1">
				<Gift class="size-4" />
				<p class="text-base font-semibold">{checkout.deliveryLabel}</p>
			</div>
			<p class="mt-1 text-xs leading-relaxed text-muted-foreground">{checkout.deliveryDescription}</p>
		</div>

		<div class="space-y-3">
			<div class="flex items-center justify-between text-sm">
				<span class="text-muted-foreground">Items</span>
				<span class="font-medium">{checkout.basketItemCount}</span>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-muted-foreground">Checkout status</span>
				<span class="font-medium">{checkout.checkoutStatusLabel}</span>
			</div>

			<div class="border-t border-border pt-3">
				<div class="flex items-center justify-between">
					<span class="text-lg font-semibold">Total</span>
					{#if checkout.totalPrice !== null}
						<span class="text-lg font-bold">${checkout.totalPrice.toFixed(2)}</span>
					{:else}
						<span class="text-sm font-medium text-muted-foreground">{checkout.totalPriceLabel}</span>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div class="mt-6 flex flex-col gap-3">
		<Button
			size="lg"
			class="w-full font-semibold"
			onclick={() => checkout.proceedToCheckout()}
			disabled={!checkout.canCheckout}
		>
			{#if checkout.giftIntent === 'gift'}
				<Gift class="size-4" />
				Continue to Gift Checkout
			{:else}
				<ShoppingCart class="size-4" />
				Continue to Tebex Checkout
			{/if}
		</Button>
		<Button href="/shop" variant="outline" class="w-full">Continue Shopping</Button>
	</div>
</section>
